"use strict";
/* eslint-disable prefer-const */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDependencies = exports.InstalledArtifact = exports.ProjectManifest = exports.sanitizeUri = exports.sanitizePath = exports.Artifact = exports.InstallStatus = exports.checkDemands = exports.ArtifactBase = exports.buildRegistryResolver = exports.parseArtifactDependency = void 0;
const assert_1 = require("assert");
const path_1 = require("path");
const format_1 = require("../cli/format");
const i18n_1 = require("../i18n");
const espidf_1 = require("../installers/espidf");
const registries_1 = require("../registries/registries");
const linq_1 = require("../util/linq");
const uri_1 = require("../util/uri");
const SetOfDemands_1 = require("./SetOfDemands");
function parseArtifactDependency(id) {
    const parts = id.split(':');
    if (parts.length === 2) {
        return [parts[0], parts[1]];
    }
    if (parts.length === 1) {
        return [undefined, parts[0]];
    }
    throw new Error((0, i18n_1.i) `Invalid artifact id '${id}'`);
}
exports.parseArtifactDependency = parseArtifactDependency;
function loadRegistry(session, decl) {
    const loc = decl.location.get(0);
    if (loc) {
        const locUri = session.parseLocation(loc);
        session.channels.debug(`Loading registry ${loc} (interpreted as ${locUri.toString()})`);
        return session.registryDatabase.loadRegistry(session, locUri);
    }
    return Promise.resolve(undefined);
}
async function buildRegistryResolver(session, registries) {
    // load the registries from the project file
    const result = new registries_1.RegistryResolver(session.registryDatabase);
    if (registries) {
        for (const [name, registry] of registries) {
            const loaded = await loadRegistry(session, registry);
            if (loaded) {
                result.add(loaded.location, name);
            }
        }
    }
    return result;
}
exports.buildRegistryResolver = buildRegistryResolver;
function addDisplayPrefix(prefix, targets) {
    const result = new Array();
    for (const element of targets) {
        result.push((0, i18n_1.i) `${prefix} - ${element}`);
    }
    return result;
}
class ArtifactBase {
    session;
    metadata;
    applicableDemands;
    constructor(session, metadata) {
        this.session = session;
        this.metadata = metadata;
        this.applicableDemands = new SetOfDemands_1.SetOfDemands(this.metadata, this.session);
    }
    buildRegistryByName(name) {
        const decl = this.metadata.registries.get(name);
        if (decl) {
            return loadRegistry(this.session, decl);
        }
        return Promise.resolve(undefined);
    }
}
exports.ArtifactBase = ArtifactBase;
function checkDemands(session, thisDisplayName, applicableDemands) {
    const errors = addDisplayPrefix(thisDisplayName, applicableDemands.errors);
    session.channels.error(errors);
    if (errors.length) {
        return false;
    }
    session.channels.warning(addDisplayPrefix(thisDisplayName, applicableDemands.warnings));
    session.channels.message(addDisplayPrefix(thisDisplayName, applicableDemands.messages));
    return true;
}
exports.checkDemands = checkDemands;
var InstallStatus;
(function (InstallStatus) {
    InstallStatus[InstallStatus["Installed"] = 0] = "Installed";
    InstallStatus[InstallStatus["AlreadyInstalled"] = 1] = "AlreadyInstalled";
    InstallStatus[InstallStatus["Failed"] = 2] = "Failed";
})(InstallStatus = exports.InstallStatus || (exports.InstallStatus = {}));
class Artifact extends ArtifactBase {
    shortName;
    targetLocation;
    constructor(session, metadata, shortName, targetLocation) {
        super(session, metadata);
        this.shortName = shortName;
        this.targetLocation = targetLocation;
    }
    get id() {
        return this.metadata.id;
    }
    get version() {
        return this.metadata.version;
    }
    get registryUri() {
        return this.metadata.registryUri;
    }
    get isInstalled() {
        return this.targetLocation.exists('artifact.json');
    }
    get uniqueId() {
        return `${this.registryUri.toString()}::${this.id}::${this.version}`;
    }
    async install(thisDisplayName, events, options) {
        const applicableDemands = this.applicableDemands;
        if (!checkDemands(this.session, thisDisplayName, applicableDemands)) {
            return InstallStatus.Failed;
        }
        if (await this.isInstalled && !options.force) {
            events.alreadyInstalledArtifact?.(thisDisplayName);
            return InstallStatus.AlreadyInstalled;
        }
        try {
            if (options.force) {
                try {
                    await this.uninstall();
                }
                catch {
                    // if a file is locked, it may not get removed. We'll deal with this later.
                }
            }
            // ok, let's install this.
            events.startInstallArtifact?.(thisDisplayName);
            for (const installInfo of applicableDemands.installer) {
                if (installInfo.lang && !options.allLanguages && options.language && options.language.toLowerCase() !== installInfo.lang.toLowerCase()) {
                    continue;
                }
                const installer = this.session.artifactInstaller(installInfo);
                if (!installer) {
                    (0, assert_1.fail)((0, i18n_1.i) `Unknown installer type ${installInfo.installerKind}`);
                }
                await installer(this.session, this.id, this.version, this.targetLocation, installInfo, events, options);
            }
            if (this.metadata.espidf) {
                await (0, espidf_1.installEspIdf)(this.session, events, this.targetLocation);
            }
            // after we unpack it, write out the installed manifest
            await this.writeManifest();
            return InstallStatus.Installed;
        }
        catch (err) {
            try {
                await this.uninstall();
            }
            catch {
                // if a file is locked, it may not get removed. We'll deal with this later.
            }
            throw err;
        }
    }
    async writeManifest() {
        await this.targetLocation.createDirectory();
        await this.metadata.save(this.targetLocation.join('artifact.json'));
    }
    async uninstall() {
        await this.targetLocation.delete({ recursive: true, useTrash: false });
    }
    async loadActivationSettings(activation) {
        // construct paths (bin, lib, include, etc.)
        // construct tools
        // compose variables
        // defines
        for (const exportsBlock of this.applicableDemands.exports) {
            activation.addExports(exportsBlock, this.targetLocation);
        }
        // if espressif install
        if (this.metadata.espidf) {
            // activate
            if (!await (0, espidf_1.activateEspIdf)(this.session, activation, this.targetLocation)) {
                return false;
            }
        }
        return true;
    }
    async sanitizeAndValidatePath(path) {
        try {
            const loc = this.session.fileSystem.file((0, path_1.resolve)(this.targetLocation.fsPath, path));
            if (await loc.exists()) {
                return loc;
            }
        }
        catch {
            // no worries, treat it like a relative path.
        }
        const loc = this.targetLocation.join(sanitizePath(path));
        if (await loc.exists()) {
            return loc;
        }
        return undefined;
    }
}
exports.Artifact = Artifact;
function sanitizePath(path) {
    return path.
        replace(/[\\/]+/g, '/'). // forward slashes please
        replace(/[?<>:|"]/g, ''). // remove illegal characters.
        // eslint-disable-next-line no-control-regex
        replace(/[\x00-\x1f\x80-\x9f]/g, ''). // remove unicode control codes
        replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, ''). // no reserved names
        replace(/^[/.]*\//, ''). // dots and slashes off the front.
        replace(/[/.]+$/, ''). // dots and slashes off the back.
        replace(/\/\.+\//g, '/'). // no parts made just of dots.
        replace(/\/+/g, '/'); // duplicate slashes.
}
exports.sanitizePath = sanitizePath;
function sanitizeUri(u) {
    return u.
        replace(/[\\/]+/g, '/'). // forward slashes please
        replace(/[?<>|"]/g, ''). // remove illegal characters.
        // eslint-disable-next-line no-control-regex
        replace(/[\x00-\x1f\x80-\x9f]/g, ''). // remove unicode control codes
        replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, ''). // no reserved names
        replace(/^[/.]*\//, ''). // dots and slashes off the front.
        replace(/[/.]+$/, ''). // dots and slashes off the back.
        replace(/\/\.+\//g, '/'). // no parts made just of dots.
        replace(/\/+/g, '/'); // duplicate slashes.
}
exports.sanitizeUri = sanitizeUri;
class ProjectManifest extends ArtifactBase {
    loadActivationSettings(activation) {
        return Promise.resolve(true);
    }
}
exports.ProjectManifest = ProjectManifest;
class InstalledArtifact extends Artifact {
    constructor(session, metadata) {
        super(session, metadata, '', uri_1.Uri.invalid);
    }
}
exports.InstalledArtifact = InstalledArtifact;
async function resolveDependencies(session, registryResolver, initialParents, dependencyDepth) {
    let depth = 0;
    let nextDepthRegistries = initialParents.map((parent) => parent.metadata.registryUri ? registryResolver.getRegistryByUri(parent.metadata.registryUri) : undefined);
    let currentRegistries = [];
    let nextDepth = initialParents;
    let initialSelections = new Set();
    let current = [];
    let resultSet = new Map(); // uniqueId, artifact
    let orderer = new Map(); // uniqueId, [depth, priority]
    while (nextDepth.length !== 0) {
        ++depth;
        currentRegistries = nextDepthRegistries;
        nextDepthRegistries = [];
        current = nextDepth;
        nextDepth = [];
        if (depth == dependencyDepth) {
            initialSelections = new Set(resultSet.keys());
        }
        for (let idx = 0; idx < current.length; ++idx) {
            const subjectParentRegistry = currentRegistries[idx];
            const subject = current[idx];
            let subjectId;
            let subjectUniqueId;
            if (subject instanceof Artifact) {
                subjectId = subject.id;
                subjectUniqueId = subject.uniqueId;
            }
            else {
                subjectId = subject.metadata.file.toString();
                subjectUniqueId = subjectId;
            }
            session.channels.debug(`Resolving ${subjectUniqueId}'s dependencies...`);
            // Note that we must update depth even if visiting the same artifact again
            orderer.set(subjectUniqueId, [depth, subject.metadata.priority]);
            if (resultSet.has(subjectUniqueId)) {
                session.channels.debug(`${subjectUniqueId} is a terminal dependency with a depth of ${depth}.`);
                // already visited
                continue;
            }
            resultSet.set(subjectUniqueId, subject);
            for (const [idOrShortName, version] of linq_1.linq.entries(subject.applicableDemands.requires)) {
                const [dependencyRegistryDeclaredName, dependencyId] = parseArtifactDependency(idOrShortName);
                let dependencyRegistry;
                if (dependencyRegistryDeclaredName) {
                    const maybeRegistry = await subject.buildRegistryByName(dependencyRegistryDeclaredName);
                    if (!maybeRegistry) {
                        throw new Error((0, i18n_1.i) `While resolving dependencies of ${subjectId}, ${dependencyRegistryDeclaredName} in ${idOrShortName} could not be resolved to a registry.`);
                    }
                    dependencyRegistry = maybeRegistry;
                }
                else {
                    if (!subjectParentRegistry) {
                        throw new Error((0, i18n_1.i) `While resolving dependencies of the project file ${subjectId}, ${idOrShortName} did not specify a registry.`);
                    }
                    dependencyRegistry = subjectParentRegistry;
                }
                const dependencyRegistryDisplayName = registryResolver.getRegistryDisplayName(dependencyRegistry.location);
                session.channels.debug(`Interpreting '${idOrShortName}' as ${dependencyRegistry.location.toString()}:${dependencyId}`);
                const dependency = await (0, registries_1.getArtifact)(dependencyRegistry, dependencyId, version.raw);
                if (!dependency) {
                    throw new Error((0, i18n_1.i) `Unable to resolve dependency ${dependencyId} in ${(0, format_1.prettyRegistryName)(dependencyRegistryDisplayName)}.`);
                }
                session.channels.debug(`Resolved dependency ${(0, format_1.artifactIdentity)(dependencyRegistryDisplayName, dependency[0], dependency[1].shortName)}`);
                nextDepthRegistries.push(dependencyRegistry);
                nextDepth.push(dependency[1]);
            }
        }
    }
    if (initialSelections.size === 0) {
        initialSelections = new Set(resultSet.keys());
    }
    session.channels.debug(`The following are initial selections: ${Array.from(initialSelections).join(', ')}`);
    const results = new Array();
    for (const [uniqueId, artifact] of resultSet) {
        const order = orderer.get(uniqueId);
        if (order) {
            results.push({
                'artifact': artifact,
                'uniqueId': uniqueId,
                'initialSelection': initialSelections.has(uniqueId),
                'depth': order[0],
                'priority': artifact.metadata.priority
            });
        }
        else {
            throw new Error('Result artifact with no order (bug in resolveDependencies)');
        }
    }
    results.sort((a, b) => {
        if (a.depth != b.depth) {
            return b.depth - a.depth;
        }
        return a.priority - b.priority;
    });
    return results;
}
exports.resolveDependencies = resolveDependencies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aWZhY3QuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL21pY3Jvc29mdC92Y3BrZy10b29sL21haW4vdmNwa2ctYXJ0aWZhY3RzLyIsInNvdXJjZXMiOlsiYXJ0aWZhY3RzL2FydGlmYWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxpQ0FBaUM7QUFDakMsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLG1DQUE4QjtBQUM5QiwrQkFBK0I7QUFHL0IsMENBQXFFO0FBQ3JFLGtDQUE0QjtBQUM1QixpREFBcUU7QUFFckUseURBQW1GO0FBRW5GLHVDQUFvQztBQUNwQyxxQ0FBa0M7QUFFbEMsaURBQThDO0FBSTlDLFNBQWdCLHVCQUF1QixDQUFDLEVBQVU7SUFDaEQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7SUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUI7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsUUFBQyxFQUFBLHdCQUF3QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFYRCwwREFXQztBQUVELFNBQVMsWUFBWSxDQUFDLE9BQWdCLEVBQUUsSUFBeUI7SUFDL0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsSUFBSSxHQUFHLEVBQUU7UUFDUCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFD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
// SIG // Begin signature block
// SIG // MIIoUAYJKoZIhvcNAQcCoIIoQTCCKD0CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // f06qECwRYhLWMQMJawEwq69rYSYjaptH1b67BFLaZ2Kg
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
// SIG // ghojMIIaHwIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCfOaRb5Nib4pxX
// SIG // NIzEs9SyhYSacu8VnCkaz/w9SpECcDBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBADxM7LByutauejwLIxr+jJVrzueP7mdg
// SIG // w7Gc1oil6vBvdBeA5PLr89ajjjv23FyOfJNegh76GhDQ
// SIG // 4QCNVRiHnjROHxibGawz8w9IZKhjUtwPk5RH8oblsABH
// SIG // 0KCCqrXcHc3tIxut5n/78CSGcNRNTbHeH0ralCMyHHUn
// SIG // HXweswJN8W9gwhUBwDvHQBEm3YOZZd/Rb0+/FKEYfcad
// SIG // Q3DhbdZu04rmmP3tUgaEymZ2mYUIucaG+Bqhtl8PZcjd
// SIG // 2agMyJIm54LnA22HkaK5Bx1BJBRJniV6/vGeqyYm6f84
// SIG // 38dqN1ut2lnoioxJKAjIE+VLVkucUuMiEWf9ayMEe8SZ
// SIG // /zuhghetMIIXqQYKKwYBBAGCNwMDATGCF5kwgheVBgkq
// SIG // hkiG9w0BBwKggheGMIIXggIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // lRAaoQepEfSTTcpFT+xeAFwPXR33eQnnUe/RzBWA3skC
// SIG // Bme2NmmdwhgTMjAyNTA0MDExOTU5NDMuOTQ4WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046MkQxQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH7MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAf1z+WhazQxh7QABAAAB/TANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMTZaFw0yNTEwMjIxODMx
// SIG // MTZaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjoy
// SIG // RDFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBAKFlrPg/jruCY2J0R0Xn
// SIG // btDExWMzSRFT5yC83NNkd6m57o74WYJIafqf5cpmC85E
// SIG // Mhts6cWHHk4yBex4kFm7ehVtwEZAa7YSVM9OWZyqXBd9
// SIG // ZaVBG/IFF4g9sSKaPGDPkg9EvoUz9UwgP8Ht/MmdwRLZ
// SIG // mbXFZ2i0afwL7KoPuSiNCsOkwyaSsEy5dFVtP9t7CopH
// SIG // lg0px0Hk6aztMyJv27WoEmJt1f/M15X8cu7PxFRXUoJR
// SIG // xrFKvBGbqVDvF2x88+7VEcog95DsTZ8OaMdXmV/3P15l
// SIG // uB+m+MjZmRdME2bsN+8gNTySjskkq161hIfh+vvlm+vt
// SIG // ZbTAj6DCR1LTz9wp9AjXDb6z8ibQ2nKo5yE6y867B3Ti
// SIG // 6o7B9tvWZL53ZNCKsQQ2YDKGPhH+33xUT9qT5KxdRfSH
// SIG // AZGM/IS/kI1/ruMuFKquFLU+1UZ7Kr0f8f/kCxNKXEhI
// SIG // f1xNcNX3KeiZqvEZxxF4pMnDCzf2vymMaUj9xXxWy2bn
// SIG // /qiK8hS9IBA8rWqRp9TjY1ZIiqVT9rqlSGI+FYgo8uaS
// SIG // 1HHjHqoioGKoaZlBwhNlrLCy4XUAR3aZdvPpPmWOpuHT
// SIG // xZxKBnCR7jHCGZ8OHDsIsaI0Tq/jau9XCY+0OC9F8D77
// SIG // kx0LdKB+0SjEIJrMuwlQ+7+eXToXR13WLMjuvXQHSvp1
// SIG // pcmHAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQU6QzFwOGV
// SIG // vPsi9vt7wOkZlO6BCqQwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBAGPY
// SIG // WF/k+QJgq2Bmh/ek3UeU+dvzzThu8kmHqKb+H5Zw1kC4
// SIG // QZa2rwIPqY5Tb+V0l2ayhr/HuLOXSeVnYXwvcsBUKuE5
// SIG // l51Hrz17Zbm2ZPtNgVyuv9t4TNE0irNipYWIqs20XvEG
// SIG // zHylxA7bzKB0mU+6/sCNiII2EMJGvtz/VV4BEcLuOv3M
// SIG // 8/CEf2avrzuedtyZXerLFbs7PbsCKyYX3GAY+dJl1kQX
// SIG // DIc2oy41g4HIodA7spD3AaaEy5Ti/C6V6KKp6/kC2BOA
// SIG // aVHqdyckjGHz89oXzi94NNlhH7DsafADW3HYqjN9XZt7
// SIG // 0oXhJJoxwNs7jPk4J+I+Z/gJ8uyDg2EJCKzVYS3TC9PX
// SIG // rtXSD4aduJRbZ1k2DWhUznzKhWtwG/CgyonJqdALYUTW
// SIG // VYNATwC+fPgdFHKARis0vY7HMDk7tSZjZYrDipFVFZEi
// SIG // eRaP3LXw0j3Qk1WiF1xe5eNJNXDP19jtCXQEve0+/JWI
// SIG // 7cPz8m7s1+bIcQYf0akz7wsgISMQVSnzf4X7OAiKBWql
// SIG // idK//EgdQhrMsiHD3xIDKPHHqtcOWaNCX58hYuhrqPs9
// SIG // yzxZf3sUGkbmxK7AFE38gWOf+ZYsr4wIMg2JxAfLxzu3
// SIG // OxYNrRneYRoGLPgDqFsduPl3MsaVJAGow4ZMvQ5fvCWU
// SIG // 47bOgXE/bGE5jqHZP0oCMIIHcTCCBVmgAwIBAgITMwAA
// SIG // ABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgz
// SIG // MjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOTh
// SIG // pkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2
// SIG // AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYj
// SIG // DLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFE
// SIG // yHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2
// SIG // vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6O
// SIG // U8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUo
// SIG // veO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvr
// SIG // g0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdb
// SIG // Z2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZ
// SIG // nkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
// SIG // N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEz
// SIG // OUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
// SIG // ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5
// SIG // C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6
// SIG // bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17a
// SIG // j54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkr
// SIG // BgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQq
// SIG // p1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwr
// SIG // BgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1Jl
// SIG // cG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQY
// SIG // MBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRP
// SIG // ME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
// SIG // KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3h
// SIG // LB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnX
// SIG // wnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03d
// SIG // mLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27Y
// SIG // P0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfak
// SIG // Vqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8
// SIG // F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4s
// SIG // a3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6
// SIG // MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1A
// SIG // PMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lU
// SIG // ZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtq
// SIG // RRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
// SIG // u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLB
// SIG // gqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
// SIG // 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvp
// SIG // e784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQ
// SIG // tB1VM1izoXBm8qGCA1YwggI+AgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046MkQxQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAKI9
// SIG // FrVVUFDUiqKra44p0QLAVHaDoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlr8gMCIYDzIwMjUwNDAxMTkzODA4WhgPMjAy
// SIG // NTA0MDIxOTM4MDhaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAOuWvyACAQAwBwIBAAICGU4wBwIBAAICFA8wCgIF
// SIG // AOuYEKACAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAQEANnycbb4N2lN4rSpekflb
// SIG // HBW4rM7p4bJbMuTYqyAMcefjo6TDcLSHWjPKkJVSAFRD
// SIG // Bbw54psFAJYB9OaH+anGaZ3++PrZ2wIz/mQHZEDqx3eA
// SIG // WYjJnx9PoI3FVSKYY3T1zi4+fcwwlROU++PjsvLhXRDh
// SIG // Bcvk3/jvKDDbdPubg/BgjIK+pDLX+PiKp+FW6YhEfqVK
// SIG // E+nWnN23S9LjqHPwz1gDFVK0w3jPYs7OHWq5erhUUJ7L
// SIG // Z95H4/73WCKBbnLCbx/hbbo6FiwHg4OjsV1na0YTgDQC
// SIG // 4bJMkZs+MoCe3jZRKylFs8+v890/Y8mhLkqbu6aKbiYG
// SIG // yZPZ4RbGQkBqFjGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB/XP5aFrNDGHt
// SIG // AAEAAAH9MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIIcGADxtCjgMmIsTaXzTnVO7olsk3ZOP8dco9t0Z
// SIG // eZgZMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // gChIDclKMLyH8f3g32ErqR5HhdaehhcIygbPJUQeDUcw
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAf1z+WhazQxh7QABAAAB/TAiBCDIv7gLabg8
// SIG // NZcDvfbjRNybGmrLZ0txDccFBHRbjeNo4jANBgkqhkiG
// SIG // 9w0BAQsFAASCAgAlItGwYmdLZsiKcnb2DIxJPnl5MhtV
// SIG // 3mvSFES1v2Nq6YdJWKhOUtkw+m49k70CRJCEAWkcURFg
// SIG // h65g2hGUdo/nDKPfv1qwZ4wSCYLBH5zmJcDpFIu2GBU3
// SIG // aHQU/Df9Qtqtw5lv61RMZlOEmrL1qthXTX0RVhKZeZWU
// SIG // FG5i47JhwNcPgkoMCfVvK818euEH2o7dSgxgbC9LdG2/
// SIG // l7VquIv9MIahZXduqdSt91L38Qu3qvH4TrRvhTqSS6Xv
// SIG // 8X4Fah3pTRZYIvNZVnxK+9z9PvjREvn8NCaYd5fy9Wo8
// SIG // /jznhz42QXKKGCUGkzc89LKxR2nbjZeB0m7Y6VuglNnw
// SIG // n8oAe1NveKn2SQtTSVEjEFb7e5yxUzc3RK4OhXRLc2VM
// SIG // eV5i4yE71A9pi8NvdjESXuc9fTMNug9i4QEGyK1i+1cU
// SIG // JPxa+RuWKdnWkmCWotLvudk1YRjbNIDxJrC0LtHHGgG2
// SIG // aDTFoc7+MT5KPU1mGhfAGgpQCXKHsiDEFK2xXUvUlw7I
// SIG // gzOviU72mcYnY1pY2aQ77CVl7v0PhbIOAHbQVKQLQt+N
// SIG // 08bX0aFeORBL/caSa8pK6aebGo8UPCStpSRSfREa7CY9
// SIG // AgjMHPVY2y9bvi3f1MEfIRg1ATf/fXwEVSE3nSokQy9r
// SIG // fBQg2Ed0OSwwusa9Zk/XbpobJOJuHkwX6GV+qQ==
// SIG // End signature block
