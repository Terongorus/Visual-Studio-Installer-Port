"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const assert_1 = require("assert");
const crypto_1 = require("crypto");
const metadata_file_1 = require("./amf/metadata-file");
const artifact_1 = require("./artifacts/artifact");
const constants_1 = require("./constants");
const http_filesystem_1 = require("./fs/http-filesystem");
const local_filesystem_1 = require("./fs/local-filesystem");
const unified_filesystem_1 = require("./fs/unified-filesystem");
const vsix_local_filesystem_1 = require("./fs/vsix-local-filesystem");
const i18n_1 = require("./i18n");
const git_1 = require("./installers/git");
const nuget_1 = require("./installers/nuget");
const untar_1 = require("./installers/untar");
const unzip_1 = require("./installers/unzip");
const registries_1 = require("./registries/registries");
const channels_1 = require("./util/channels");
function hexsha(content) {
    return (0, crypto_1.createHash)('sha256').update(content, 'ascii').digest('hex');
}
function formatArtifactEntry(entry) {
    // we hash all the things to remove PII
    return `${hexsha(entry.registryUri)}:${hexsha(entry.id)}:${hexsha(entry.version)}`;
}
/**
 * The Session class is used to hold a reference to the
 * message channels,
 * the filesystems,
 * and any other 'global' data that should be kept.
 *
 */
class Session {
    context;
    settings;
    /** @internal */
    stopwatch = new channels_1.Stopwatch();
    fileSystem;
    channels;
    homeFolder;
    nextPreviousEnvironment;
    installFolder;
    registryFolder;
    telemetryFile;
    get vcpkgCommand() { return this.settings.vcpkgCommand; }
    globalConfig;
    downloads;
    currentDirectory;
    configuration;
    /** register installer functions here */
    installers = new Map([
        ['nuget', nuget_1.installNuGet],
        ['unzip', unzip_1.installUnZip],
        ['untar', untar_1.installUnTar],
        ['git', git_1.installGit]
    ]);
    registryDatabase = new registries_1.RegistryDatabase();
    globalRegistryResolver = new registries_1.RegistryResolver(this.registryDatabase);
    processVcpkgArg(argSetting, defaultName) {
        return argSetting ? this.fileSystem.file(argSetting) : this.homeFolder.join(defaultName);
    }
    constructor(currentDirectory, context, settings) {
        this.context = context;
        this.settings = settings;
        this.fileSystem = new unified_filesystem_1.UnifiedFileSystem(this).
            register('file', new local_filesystem_1.LocalFileSystem(this)).
            register('vsix', new vsix_local_filesystem_1.VsixLocalFilesystem(this)).
            register('https', new http_filesystem_1.HttpsFileSystem(this));
        this.channels = new channels_1.Channels(this);
        if (settings.telemetryFile) {
            this.telemetryFile = this.fileSystem.file(settings.telemetryFile);
        }
        this.homeFolder = this.fileSystem.file(settings.homeFolder);
        this.downloads = this.processVcpkgArg(settings.vcpkgDownloads, 'downloads');
        this.globalConfig = this.processVcpkgArg(settings.globalConfig, constants_1.configurationName);
        this.registryFolder = this.processVcpkgArg(settings.vcpkgRegistriesCache, 'registries').join('artifact');
        this.installFolder = this.processVcpkgArg(settings.vcpkgArtifactsRoot, 'artifacts');
        this.nextPreviousEnvironment = this.processVcpkgArg(settings.nextPreviousEnvironment, `previous-environment-${Date.now().toFixed()}.json`);
        this.currentDirectory = this.fileSystem.file(currentDirectory);
    }
    parseLocation(location) {
        // Drive letter, absolute Unix path, or drive-relative windows path, treat as a file
        if (/^[A-Za-z]:/.exec(location) || location.startsWith('/') || location.startsWith('\\')) {
            return this.fileSystem.file(location);
        }
        // Otherwise, it's a URI
        return this.fileSystem.parseUri(location);
    }
    async saveConfig() {
        await this.configuration?.save(this.globalConfig);
    }
    async init() {
        // load global configuration
        if (!await this.fileSystem.isDirectory(this.homeFolder)) {
            // let's create the folder
            try {
                await this.fileSystem.createDirectory(this.homeFolder);
            }
            catch (error) {
                // if this throws, let it
                this.channels.debug(error?.message);
            }
            // check if it got made, because at an absolute minimum, we need a folder, so failing this is catastrophic.
            assert_1.strict.ok(await this.fileSystem.isDirectory(this.homeFolder), (0, i18n_1.i) `Fatal: The root folder '${this.homeFolder.fsPath}' cannot be created`);
        }
        if (!await this.fileSystem.isFile(this.globalConfig)) {
            try {
                await this.globalConfig.writeUTF8(constants_1.defaultConfig);
            }
            catch {
                // if this throws, let it
            }
            // check if it got made, because at an absolute minimum, we need the config file, so failing this is catastrophic.
            assert_1.strict.ok(await this.fileSystem.isFile(this.globalConfig), (0, i18n_1.i) `Fatal: The global configuration file '${this.globalConfig.fsPath}' cannot be created`);
        }
        // got past the checks, let's load the configuration.
        this.configuration = await metadata_file_1.MetadataFile.parseMetadata(this.globalConfig.fsPath, this.globalConfig, this);
        this.channels.debug(`Loaded global configuration file '${this.globalConfig.fsPath}'`);
        // load the registries
        for (const [name, regDef] of this.configuration.registries) {
            const loc = regDef.location.get(0);
            if (loc) {
                const uri = this.parseLocation(loc);
                const reg = await this.registryDatabase.loadRegistry(this, uri);
                this.globalRegistryResolver.add(uri, name);
                if (reg) {
                    this.channels.debug(`Loaded global manifest ${name} => ${uri.formatted}`);
                }
            }
        }
        return this;
    }
    async findProjectProfile(startLocation = this.currentDirectory) {
        let location = startLocation;
        const path = location.join(constants_1.configurationName);
        if (await this.fileSystem.isFile(path)) {
            return path;
        }
        location = location.join('..');
        return (location.toString() === startLocation.toString()) ? undefined : this.findProjectProfile(location);
    }
    async getInstalledArtifacts() {
        const result = new Array();
        if (!await this.installFolder.exists()) {
            return result;
        }
        for (const [folder, stat] of await this.installFolder.readDirectory(undefined, { recursive: true })) {
            try {
                const artifactJsonPath = folder.join('artifact.json');
                const metadata = await metadata_file_1.MetadataFile.parseMetadata(artifactJsonPath.fsPath, artifactJsonPath, this);
                result.push({
                    folder,
                    id: metadata.id,
                    artifact: await new artifact_1.InstalledArtifact(this, metadata)
                });
            }
            catch {
                // not a valid install.
            }
        }
        return result;
    }
    /** returns an installer function (or undefined) for a given installerkind */
    artifactInstaller(installInfo) {
        return this.installers.get(installInfo.installerKind);
    }
    async openManifest(filename, uri) {
        return await metadata_file_1.MetadataFile.parseConfiguration(filename, await uri.readUTF8(), this);
    }
    #acquiredArtifacts = [];
    #activatedArtifacts = [];
    trackAcquire(registryUri, id, version) {
        this.#acquiredArtifacts.push({ registryUri: registryUri, id: id, version: version });
    }
    trackActivate(registryUri, id, version) {
        this.#activatedArtifacts.push({ registryUri: registryUri, id: id, version: version });
    }
    writeTelemetry() {
        const acquiredArtifacts = this.#acquiredArtifacts.map(formatArtifactEntry).join(',');
        const activatedArtifacts = this.#activatedArtifacts.map(formatArtifactEntry).join(',');
        const telemetryFile = this.telemetryFile;
        if (telemetryFile) {
            return telemetryFile.writeUTF8(JSON.stringify({
                'acquired-artifacts': acquiredArtifacts,
                'activated-artifacts': activatedArtifacts
            }));
        }
        return Promise.resolve(undefined);
    }
}
exports.Session = Session;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJzZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsbUNBQWdDO0FBQ2hDLG1DQUFvQztBQUNwQyx1REFBbUQ7QUFDbkQsbURBQW1FO0FBQ25FLDJDQUErRDtBQUUvRCwwREFBdUQ7QUFDdkQsNERBQXdEO0FBQ3hELGdFQUE0RDtBQUM1RCxzRUFBaUU7QUFDakUsaUNBQTJCO0FBQzNCLDBDQUE4QztBQUM5Qyw4Q0FBa0Q7QUFDbEQsOENBQWtEO0FBQ2xELDhDQUFrRDtBQUdsRCx3REFBNkU7QUFDN0UsOENBQXNEO0FBNkN0RCxTQUFTLE1BQU0sQ0FBQyxPQUFlO0lBQzdCLE9BQU8sSUFBQSxtQkFBVSxFQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLEtBQW9CO0lBQy9DLHVDQUF1QztJQUN2QyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUNyRixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxPQUFPO0lBZ0NvQztJQUFrQztJQS9CeEYsZ0JBQWdCO0lBQ1AsU0FBUyxHQUFHLElBQUksb0JBQVMsRUFBRSxDQUFDO0lBQzVCLFVBQVUsQ0FBYTtJQUN2QixRQUFRLENBQVc7SUFDbkIsVUFBVSxDQUFNO0lBQ2hCLHVCQUF1QixDQUFNO0lBQzdCLGFBQWEsQ0FBTTtJQUNuQixjQUFjLENBQU07SUFDcEIsYUFBYSxDQUFrQjtJQUN4QyxJQUFJLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUVoRCxZQUFZLENBQU07SUFDbEIsU0FBUyxDQUFNO0lBQ3hCLGdCQUFnQixDQUFNO0lBQ3RCLGFBQWEsQ0FBZ0I7SUFFN0Isd0NBQXdDO0lBQ2hDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBd0I7UUFDbEQsQ0FBQyxPQUFPLEVBQUUsb0JBQVksQ0FBQztRQUN2QixDQUFDLE9BQU8sRUFBRSxvQkFBWSxDQUFDO1FBQ3ZCLENBQUMsT0FBTyxFQUFFLG9CQUFZLENBQUM7UUFDdkIsQ0FBQyxLQUFLLEVBQUUsZ0JBQVUsQ0FBQztLQUNwQixDQUFDLENBQUM7SUFFTSxnQkFBZ0IsR0FBRyxJQUFJLDZCQUFnQixFQUFFLENBQUM7SUFDMUMsc0JBQXNCLEdBQUcsSUFBSSw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RSxlQUFlLENBQUMsVUFBOEIsRUFBRSxXQUFtQjtRQUNqRSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFRCxZQUFZLGdCQUF3QixFQUFrQixPQUFnQixFQUFrQixRQUF5QjtRQUEzRCxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQWtCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQy9HLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxzQ0FBaUIsQ0FBQyxJQUFJLENBQUM7WUFDM0MsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLGtDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLDJDQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxpQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUMxQyxDQUFDO1FBRUosSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFO1lBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsNkJBQWlCLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSx3QkFBd0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUzSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsYUFBYSxDQUFDLFFBQWdCO1FBQzVCLG9GQUFvRjtRQUNwRixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hGLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkM7UUFFRCx3QkFBd0I7UUFDeEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUiw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3ZELDBCQUEwQjtZQUMxQixJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3hEO1lBQUMsT0FBTyxLQUFVLEVBQUU7Z0JBQ25CLHlCQUF5QjtnQkFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsMkdBQTJHO1lBQzNHLGVBQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBQSxRQUFDLEVBQUEsMkJBQTJCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3hJO1FBRUQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3BELElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyx5QkFBYSxDQUFDLENBQUM7YUFDbEQ7WUFBQyxNQUFNO2dCQUNOLHlCQUF5QjthQUMxQjtZQUNELGtIQUFrSDtZQUNsSCxlQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUEsUUFBQyxFQUFBLHlDQUF5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0scUJBQXFCLENBQUMsQ0FBQztTQUNySjtRQUVELHFEQUFxRDtRQUNyRCxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sNEJBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRXRGLHNCQUFzQjtRQUN0QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUU7WUFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLElBQUksR0FBRyxFQUFFO29CQUNQLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDBCQUEwQixJQUFJLE9BQU8sR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7aUJBQzNFO2FBQ0Y7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQjtRQUM1RCxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUM7UUFDN0IsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO1FBQzlDLElBQUksTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUcsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUI7UUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQW1ELENBQUM7UUFDNUUsSUFBSSxDQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN2QyxPQUFPLE1BQU0sQ0FBQztTQUNmO1FBQ0QsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7WUFDbkcsSUFBSTtnQkFDRixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sUUFBUSxHQUFHLE1BQU0sNEJBQVksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRyxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNWLE1BQU07b0JBQ04sRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO29CQUNmLFFBQVEsRUFBRSxNQUFNLElBQUksNEJBQWlCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztpQkFDdEQsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxNQUFNO2dCQUNOLHVCQUF1QjthQUN4QjtTQUNGO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELDZFQUE2RTtJQUM3RSxpQkFBaUIsQ0FBQyxXQUFzQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFnQixFQUFFLEdBQVE7UUFDM0MsT0FBTyxNQUFNLDRCQUFZLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFUSxrQkFBa0IsR0FBeUIsRUFBRSxDQUFDO0lBQzlDLG1CQUFtQixHQUF5QixFQUFFLENBQUM7SUFFeEQsWUFBWSxDQUFDLFdBQW1CLEVBQUUsRUFBVSxFQUFFLE9BQWU7UUFDM0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsYUFBYSxDQUFDLFdBQW1CLEVBQUUsRUFBVSxFQUFFLE9BQWU7UUFDNUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRUQsY0FBYztRQUNaLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkYsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUN6QyxJQUFJLGFBQWEsRUFBRTtZQUNqQixPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDNUMsb0JBQW9CLEVBQUUsaUJBQWlCO2dCQUN2QyxxQkFBcUIsRUFBRSxrQkFBa0I7YUFDMUMsQ0FBQyxDQUFDLENBQUM7U0FDTDtRQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0Y7QUFwTEQsMEJBb0xDIn0=
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // lvgQpfCWjvkronYRzkEqlnaYeL84+8B0+BilLb4ybiug
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAABAO91ZVdDzsYrQAA
// SIG // AAAEAzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExM1oX
// SIG // DTI1MDkxMTIwMTExM1owdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // n3RnXcCDp20WFMoNNzt4s9fV12T5roRJlv+bshDfvJoM
// SIG // ZfhyRnixgUfGAbrRlS1St/EcXFXD2MhRkF3CnMYIoeMO
// SIG // MuMyYtxr2sC2B5bDRMUMM/r9I4GP2nowUthCWKFIS1RP
// SIG // lM0YoVfKKMaH7bJii29sW+waBUulAKN2c+Gn5znaiOxR
// SIG // qIu4OL8f9DCHYpME5+Teek3SL95sH5GQhZq7CqTdM0fB
// SIG // w/FmLLx98SpBu7v8XapoTz6jJpyNozhcP/59mi/Fu4tT
// SIG // 2rI2vD50Vx/0GlR9DNZ2py/iyPU7DG/3p1n1zluuRp3u
// SIG // XKjDfVKH7xDbXcMBJid22a3CPbuC2QJLowIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFOpuKgJKc+OuNYitoqxfHlrE
// SIG // gXAZMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis1MDI5MjYwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBRaP+hOC1+dSKhbqCr1LIvNEMrRiOQ
// SIG // EkPc7D6QWtM+/IbrYiXesNeeCZHCMf3+6xASuDYQ+AyB
// SIG // TX0YlXSOxGnBLOzgEukBxezbfnhUTTk7YB2/TxMUcuBC
// SIG // P45zMM0CVTaJE8btloB6/3wbFrOhvQHCILx41jTd6kUq
// SIG // 4bIBHah3NG0Q1H/FCCwHRGTjAbyiwq5n/pCTxLz5XYCu
// SIG // 4RTvy/ZJnFXuuwZynowyju90muegCToTOwpHgE6yRcTv
// SIG // Ri16LKCr68Ab8p8QINfFvqWoEwJCXn853rlkpp4k7qzw
// SIG // lBNiZ71uw2pbzjQzrRtNbCFQAfmoTtsHFD2tmZvQIg1Q
// SIG // VkzM/V1KCjHL54ItqKm7Ay4WyvqWK0VIEaTbdMtbMWbF
// SIG // zq2hkRfJTNnFr7RJFeVC/k0DNaab+bpwx5FvCUvkJ3z2
// SIG // wfHWVUckZjEOGmP7cecefrF+rHpif/xW4nJUjMUiPsyD
// SIG // btY2Hq3VMLgovj+qe0pkJgpYQzPukPm7RNhbabFNFvq+
// SIG // kXWBX/z/pyuo9qLZfTb697Vi7vll5s/DBjPtfMpyfpWG
// SIG // 0phVnAI+0mM4gH09LCMJUERZMgu9bbCGVIQR7cT5YhlL
// SIG // t+tpSDtC6XtAzq4PJbKZxFjpB5wk+SRJ1gm87olbfEV9
// SIG // SFdO7iL3jWbjgVi1Qs1iYxBmvh4WhLWr48uouzCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghoKMIIaBgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC/oGgJ7xs86tVz
// SIG // CtrVxMpb2TyEGGZ9FMpQmqdbjQjHRTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAJoPWCJoBKCziDo6Y3aJeuA/yFd6Tf7w
// SIG // NcWepq+Hyl1MGxiEpUxnO+u+DEWA/UjwRuAXgK5YaPee
// SIG // Rzpv8EymLSZwzyTjN96V8QIKiAID0Rvy/vyP03NWwN7c
// SIG // Jua1CfhGnt2UG2BXu0AfsXZ6/B4b/BltTEpZv1o+jOvb
// SIG // 64v89e8p+OyY4A+LSdlTxyR+dU9uKCvAffreoM467XKX
// SIG // IGo9J/IDITOS5EQrANjtbk6fL5Q8BwLm1Ga+X+pq4jVv
// SIG // PHKDNMohzF0I/CT6/mPfhlICGzTwvH5oreFPUt5SUDML
// SIG // uDwNZjO9WoooQTYwZWUnz1nLfn8zvfLtw1H49y9IyUe6
// SIG // 14yhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // ldXTZ5a0h6t31nv1RiOevvtBil2ZY7/uUadQqa8YU2AC
// SIG // BmfcbVMzfhgTMjAyNTA0MDExOTU5MzYuNDQzWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkUwMDIt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAILEZ1WKZL5v4UAAQAAAgswDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjU4WhcNMjYwNDIyMTk0MjU4WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkUwMDItMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAqqz4rUYwF6hYdiB80GA97spAz8iRfu/XuQpGOGmL
// SIG // G/d0Fbp+H2dybv9Fh67QBdybMEogFZe6dR9sxSq78oWl
// SIG // bkWHEnO2Lsj9BhxFau2FUubhd2C5S3qMhjjyklxrOmoF
// SIG // utAqlQYT0Ptp+PXumA/cBr+mNB5gSpp0KmPwCiYo4FIk
// SIG // bpW9aLzRHE2ZkzUbtZmPtCY4hLrPnheulTaAb9WtjFtC
// SIG // T2GxQYT8xR5XXRV3I39qiJG+QWFrBS+0JQY1wKX9h5ja
// SIG // z8xt+oNcm6Pyp0Y0oCEaR3mF8QSGghBrUdRJqSfdDkhR
// SIG // 8VLu3iI1X3p6p1bWoNMgEGO8xFklzDevgh4790gTbZuW
// SIG // SEcsgrFGRvOOeCvvOuW8OxcLh/L5OUPtOyuZRWNNngQ8
// SIG // N1Cs1o1r6k6dqSvDE2uJKM75SoK0hqebIeexp5I5bzb7
// SIG // e/DV22U1SK8Eu8XCBo270v9q+ZUQ0/kNz9rU/oOigz3S
// SIG // 57ZXGxXR7rs8icsdFnwq/Mx7/MBggd6jzm0VyuKKQCJ0
// SIG // kOI+YktvCgEyRsEGm0bnmb4b3fTndMHBWDm+KK1L9XQ+
// SIG // V8BcipRgzzHEzzkK9IMZhEFay4iRKC8slvBFf2gxVF06
// SIG // McoX81meg3NJfXnrYdRLdjUNwP6gUecd96YynRyVSeca
// SIG // adgCN2czWCwwqjtZbYc9Rmks/j0CAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBRmXCyI36/pelnjLoRPYLMXvfI//jAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAmij1Z+hi3J5GzxHTNEfauGZt
// SIG // PuyXxtOfqZqj+pwOEsE9upPR5SUI6sP/lpIkCw+KMCca
// SIG // KCK/TA2W4mV+sqT4RfoNT+bvAThFz2GJDlqcxRi0S7ZW
// SIG // R738aagCGu5oyxhw8yq/9dNgF2g+JhsnRMGixoVJ/QwR
// SIG // nTJuXYYorFgKm/yzeJZuDrl+GC6inFv9MknByoKaxoC2
// SIG // Puqar9Mz1O+I+3gq/jw0zWDPLRSf27VJwTS8jhOFmcAS
// SIG // KuLZ7143dnAjrYFJ6EIxVNWWO2VnZ8twSW394Qa29zQd
// SIG // iFOJ7uttrVa29XzZMHb0+dNVkVATHfaBX+MYn49o9gpW
// SIG // 79VxpY15nesiY77fmwbryS1LnPZvrzCjlskcFHbzpfxO
// SIG // WvM1dzK4wp2OnyKy0DcwTmepJSAjwovthqm1YjNAiOgm
// SIG // 2cqXouUa/YSWx/K2RM42mFi56/1z7FNMK9k5+i/XScdq
// SIG // vywKCvqL4gCJ49Gj+IkazMlEjuii9isGOsyXOkg8Wx5M
// SIG // GB3UEazzT90rrTIOi4AUr7Zn6sIGlyB5AqIlBRAM/XBi
// SIG // Kr4IxqRqaSk3E7qKNxBIKf80XdMMVtEKpld8oGBonHp9
// SIG // 9CgFh6yhQvEm8HOqguKaHVWWCWZoqxwT/7qO7EJ3uR9M
// SIG // bXbw5lw1H8uYDYy5Y0CFLCYUEssl20o0m9muY4TlH8cw
// SIG // ggdxMIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAV
// SIG // MA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAx
// SIG // ODIyMjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
// SIG // gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/H
// SIG // ZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKD
// SIG // RLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gm
// SIG // U3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36M
// SIG // EBydUv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+y
// SIG // OSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoF
// SIG // VZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJi
// SIG // ss254o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGa
// SIG // RnXNxF803RKJ1v2lIH1+/NmeRd+2ci/bfV+Autuqfjbs
// SIG // Nkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afo
// SIG // mXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9
// SIG // ahhaYQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZk
// SIG // i1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
// SIG // 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV
// SIG // 2xo3xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0C
// SIG // AwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
// SIG // IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/
// SIG // LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnp
// SIG // cjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8G
// SIG // CCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9
// SIG // lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcN
// SIG // AQELBQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pc
// SIG // FLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
// SIG // wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AF
// SIG // vonoaeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4
// SIG // U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2
// SIG // EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8Atq
// SIG // gcKBGUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mj
// SIG // dAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZM
// SIG // cm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQE
// SIG // cb9k+SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2f
// SIG // pCjcZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBM
// SIG // drVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L
// SIG // +DvktxW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJ
// SIG // C4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU
// SIG // 5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDTTCC
// SIG // AjUCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjpFMDAyLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAqEJ3VCTdz6atsYfEYbbEd+TQmcGggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWvMswIhgPMjAyNTA0MDExOTI4
// SIG // MTFaGA8yMDI1MDQwMjE5MjgxMVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65a8ywIBADAHAgEAAgISyTAHAgEA
// SIG // AgITLjAKAgUA65gOSwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQB/UabeENTa
// SIG // RWVcqVNJAHfanQUbUqbqtimqUzIR+gGmxabt3mYMIjB9
// SIG // WeQkA8stBadmPlb4kmRZ42Q17+52DWcevX2OFxP6yv1u
// SIG // WanvPRsip038Zl80N98V94CNEZfeWDYSVyM89xm+TIAl
// SIG // mb51triPp+oQvgl0e9ASXqG3JGJBZvNDu3mlpqKKSN8j
// SIG // eUxgik/qHdYDSZUhLvZKCWF5IlHZhfX3+7Q2lJKqgWNo
// SIG // hIro5SgIPa8Z4ru3jBVfCZYwPC+3ysMLMxpgXt2E7YnA
// SIG // rOebzGZcEdkZezouJtYYjv3Hcta5Yjmxsr2J5Dva+skL
// SIG // txEAjIP+ozbpHVDjAEmKGmccMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIL
// SIG // EZ1WKZL5v4UAAQAAAgswDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgoX2tVP8elaXGeif1paqDVGZPW+l4
// SIG // v+0kU72+Aod/2VUwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCA01XSruje+24dMHTshfqIETfLyiXMOY539
// SIG // vxLrLGJKMzCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACCxGdVimS+b+FAAEAAAILMCIE
// SIG // IIcSDL2zZNuP32ZhVsQBtKO0oPIyeoG64V18iD9vzoJ0
// SIG // MA0GCSqGSIb3DQEBCwUABIICAArGrUO0mlqOEbrQ5qyX
// SIG // FF/G6+8vQaxrsk1H7orHVevcILA7wxM0WJiDcJGREBrQ
// SIG // 8qWO2smo1rxZD6owBoXEyNVuyggFfWdBWRcKju6vJBXS
// SIG // N+V4VSeIKkQwUu86/dkppDOkL/TejvV9kRB75ve4CdoU
// SIG // kmKqzOJM1j0hfU76pMFQQspcH6L9hgeRp1kh9vRQFHrt
// SIG // hatqmM/dld5HfflFaiJ/18x3hzG6sivvjhjXecqpOrOu
// SIG // 5xV4gdjY0aRQX70nSqOhXnvpVbqeyXFy0UP4dUoUZGFg
// SIG // 75vNY59eWZXE5HO8JgoclYv7U08q9jxFP9xDzEh13VHV
// SIG // LJURdoqijp3fq4a+arghRPZhuTpT5BGD0IafRYBGdL98
// SIG // TA+sjpUl7PFXm8r9ROn6MtC1B+8t1H2TJkYPk0nLeHm/
// SIG // VLgz/ryKacUzet21epMum+67eHCcK1UyLVbRzSQxh+n8
// SIG // S6W0iaCWUuks1c+ePWFoTQ8hXxw6AVnwTnaKJ6T+8OXP
// SIG // 0Ra/ZhXIMcb3v1dcqcF+80bNbRNjYGl5Mqvh2Nd4couv
// SIG // VyDDq8t/o3JkRknWmwGtZKUMpaw7UgMUejGr1/mLNUzU
// SIG // X9nDsHNHqvNIFzL9MWFa1c2rPbz5PcKwJVbcMVn8thYT
// SIG // UlYUUlkcs3/GZp0Je0MIADvcoulmkE0S2bFYF69HTj1k
// SIG // fdvq
// SIG // End signature block
