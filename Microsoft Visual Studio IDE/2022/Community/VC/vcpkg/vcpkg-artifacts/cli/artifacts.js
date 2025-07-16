"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireArtifacts = exports.selectArtifacts = exports.showArtifacts = void 0;
const cli_progress_1 = require("cli-progress");
const artifact_1 = require("../artifacts/artifact");
const i18n_1 = require("../i18n");
const registries_1 = require("../registries/registries");
const console_table_1 = require("./console-table");
const format_1 = require("./format");
const styling_1 = require("./styling");
async function showArtifacts(artifacts, registries, options) {
    let failing = false;
    const table = new console_table_1.Table((0, i18n_1.i) `Artifact`, (0, i18n_1.i) `Version`, (0, i18n_1.i) `Status`, (0, i18n_1.i) `Dependency`, (0, i18n_1.i) `Summary`);
    for (const resolved of artifacts) {
        const artifact = resolved.artifact;
        if (artifact instanceof artifact_1.Artifact) {
            const name = (0, format_1.artifactIdentity)(registries.getRegistryDisplayName(artifact.registryUri), artifact.id, artifact.shortName);
            for (const err of artifact.metadata.validate()) {
                failing = true;
                (0, styling_1.error)(artifact.metadata.formatVMessage(err));
            }
            table.push(name, artifact.version, options?.force || await artifact.isInstalled ? 'installed' : 'will install', resolved.initialSelection ? ' ' : '*', artifact.metadata.summary || '');
        }
    }
    (0, styling_1.log)(table.toString());
    (0, styling_1.log)();
    return !failing;
}
exports.showArtifacts = showArtifacts;
async function selectArtifacts(session, selections, registries, dependencyDepth) {
    const userSelectedArtifacts = new Map();
    const userSelectedVersions = new Map();
    for (const [idOrShortName, version] of selections) {
        const [, artifact] = await (0, registries_1.getArtifact)(registries, idOrShortName, version) || [];
        if (!artifact) {
            (0, styling_1.error)(`Unable to resolve artifact: ${(0, format_1.addVersionToArtifactIdentity)(idOrShortName, version)}`);
            const results = await registries.search({ keyword: idOrShortName, version: version });
            if (results.length) {
                (0, styling_1.log)('Possible matches:');
                for (const [artifactDisplay, artifactVersions] of results) {
                    for (const artifactVersion of artifactVersions) {
                        (0, styling_1.log)(`  ${(0, format_1.addVersionToArtifactIdentity)(artifactDisplay, artifactVersion.version)}`);
                    }
                }
            }
            return false;
        }
        userSelectedArtifacts.set(artifact.uniqueId, artifact);
        userSelectedVersions.set(artifact.uniqueId, version);
    }
    const allResolved = await (0, artifact_1.resolveDependencies)(session, registries, Array.from(userSelectedArtifacts.values()), dependencyDepth);
    const results = new Array();
    for (const resolved of allResolved) {
        results.push({ ...resolved, 'requestedVersion': userSelectedVersions.get(resolved.uniqueId) });
    }
    return results;
}
exports.selectArtifacts = selectArtifacts;
var TaggedProgressKind;
(function (TaggedProgressKind) {
    TaggedProgressKind[TaggedProgressKind["Unset"] = 0] = "Unset";
    TaggedProgressKind[TaggedProgressKind["Verifying"] = 1] = "Verifying";
    TaggedProgressKind[TaggedProgressKind["Downloading"] = 2] = "Downloading";
    TaggedProgressKind[TaggedProgressKind["GenericProgress"] = 3] = "GenericProgress";
    TaggedProgressKind[TaggedProgressKind["Heartbeat"] = 4] = "Heartbeat";
})(TaggedProgressKind || (TaggedProgressKind = {}));
class TaggedProgressBar {
    multiBar;
    bar;
    kind = TaggedProgressKind.Unset;
    lastCurrentValue = 0;
    constructor(multiBar) {
        this.multiBar = multiBar;
    }
    checkChangeKind(currentValue, kind) {
        this.lastCurrentValue = currentValue;
        if (this.kind !== kind) {
            if (this.bar) {
                this.multiBar.remove(this.bar);
                this.bar = undefined;
            }
            this.kind = kind;
        }
    }
    startOrUpdate(kind, total, currentValue, suffix) {
        this.checkChangeKind(currentValue, kind);
        const payload = { suffix: suffix };
        if (this.bar) {
            this.bar.update(currentValue, payload);
        }
        else {
            this.kind = kind;
            this.bar = this.multiBar.create(total, currentValue, payload, { format: '{bar} {percentage}% {suffix}' });
        }
    }
    heartbeat(suffix) {
        this.checkChangeKind(0, TaggedProgressKind.Heartbeat);
        const payload = { suffix: suffix };
        if (this.bar) {
            this.bar.update(0, payload);
        }
        else {
            const progressUnknown = (0, i18n_1.i) `(progress unknown)`;
            const totalSpaces = 41 - progressUnknown.length;
            const prefixSpaces = Math.floor(totalSpaces / 2);
            const suffixSpaces = totalSpaces - prefixSpaces;
            const prettyProgressUnknown = Array(prefixSpaces).join(' ') + progressUnknown + Array(suffixSpaces).join(' ');
            this.bar = this.multiBar.create(0, 0, payload, { format: '*' + prettyProgressUnknown + '* {suffix}' });
        }
    }
}
class TtyProgressRenderer {
    #bar = new cli_progress_1.MultiBar({
        clearOnComplete: true,
        hideCursor: true,
        barCompleteChar: '*',
        barIncompleteChar: ' ',
        etaBuffer: 40
    });
    #overallProgress;
    #individualProgress;
    constructor(totalArtifactCount) {
        this.#overallProgress = this.#bar.create(totalArtifactCount, 0, { name: '' }, { format: `{bar} [{value}/${totalArtifactCount - 1}] {name}`, emptyOnZero: true });
        this.#individualProgress = new TaggedProgressBar(this.#bar);
    }
    setArtifactIndex(index, displayName) {
        this.#overallProgress.update(index, { name: displayName });
    }
    hashVerifyProgress(file, percent) {
        this.#individualProgress.startOrUpdate(TaggedProgressKind.Verifying, 100, percent, (0, i18n_1.i) `verifying` + ' ' + file);
    }
    downloadProgress(uri, destination, percent) {
        this.#individualProgress.startOrUpdate(TaggedProgressKind.Downloading, 100, percent, (0, i18n_1.i) `downloading ${uri.toString()} -> ${destination}`);
    }
    unpackArchiveStart(archiveUri) {
        this.#individualProgress.heartbeat((0, i18n_1.i) `unpacking ${archiveUri.fsPath}`);
    }
    unpackArchiveHeartbeat(text) {
        this.#individualProgress.heartbeat(text);
    }
    stop() {
        this.#bar.stop();
    }
}
const downloadUpdateRateMs = 10 * 1000;
class NoTtyProgressRenderer {
    channels;
    totalArtifactCount;
    #currentIndex = 0;
    #downloadPrecent = 0;
    #downloadTimeoutId;
    constructor(channels, totalArtifactCount) {
        this.channels = channels;
        this.totalArtifactCount = totalArtifactCount;
    }
    setArtifactIndex(index) {
        this.#currentIndex = index;
    }
    startInstallArtifact(displayName) {
        this.channels.message(`[${this.#currentIndex + 1}/${this.totalArtifactCount - 1}] ` + (0, i18n_1.i) `Installing ${displayName}...`);
    }
    alreadyInstalledArtifact(displayName) {
        this.channels.message(`[${this.#currentIndex + 1}/${this.totalArtifactCount - 1}] ` + (0, i18n_1.i) `${displayName} already installed.`);
    }
    downloadStart(uris, destination) {
        let displayUri;
        if (uris.length === 1) {
            displayUri = uris[0].toString();
        }
        else {
            displayUri = JSON.stringify(uris.map(uri => uri.toString()));
        }
        this.channels.message((0, i18n_1.i) `Downloading ${displayUri}...`);
        this.#downloadTimeoutId = setTimeout(this.downloadProgressDisplay.bind(this), downloadUpdateRateMs);
    }
    downloadProgress(uri, destination, percent) {
        this.#downloadPrecent = percent;
    }
    downloadProgressDisplay() {
        this.channels.message(`${this.#downloadPrecent}%`);
        this.#downloadTimeoutId = setTimeout(this.downloadProgressDisplay.bind(this), downloadUpdateRateMs);
    }
    downloadComplete() {
        if (this.#downloadTimeoutId) {
            clearTimeout(this.#downloadTimeoutId);
        }
    }
    stop() {
        if (this.#downloadTimeoutId) {
            clearTimeout(this.#downloadTimeoutId);
        }
    }
    unpackArchiveStart(archiveUri) {
        this.channels.message((0, i18n_1.i) `Unpacking ${archiveUri.fsPath}...`);
    }
}
async function acquireArtifacts(session, resolved, registries, options) {
    // resolve the full set of artifacts to install.
    const isTty = process.stdout.isTTY === true;
    const progressRenderer = isTty ? new TtyProgressRenderer(resolved.length) : new NoTtyProgressRenderer(session.channels, resolved.length);
    for (let idx = 0; idx < resolved.length; ++idx) {
        const artifact = resolved[idx].artifact;
        if (artifact instanceof artifact_1.Artifact) {
            const id = artifact.id;
            const registryName = registries.getRegistryDisplayName(artifact.registryUri);
            const artifactDisplayName = (0, format_1.artifactIdentity)(registryName, id, artifact.shortName);
            progressRenderer.setArtifactIndex?.(idx, artifactDisplayName);
            try {
                const installStatus = await artifact.install(artifactDisplayName, progressRenderer, options || {});
                switch (installStatus) {
                    case artifact_1.InstallStatus.Installed:
                        session.trackAcquire(artifact.registryUri.toString(), id, artifact.version);
                        break;
                    case artifact_1.InstallStatus.AlreadyInstalled:
                        break;
                    case artifact_1.InstallStatus.Failed:
                        progressRenderer.stop?.();
                        return false;
                }
            }
            catch (e) {
                progressRenderer.stop?.();
                (0, styling_1.debug)(e);
                (0, styling_1.debug)(e.stack);
                (0, styling_1.error)((0, i18n_1.i) `Error installing ${artifactDisplayName} - ${e}`);
                return false;
            }
        }
    }
    progressRenderer.stop?.();
    return true;
}
exports.acquireArtifacts = acquireArtifacts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aWZhY3RzLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImNsaS9hcnRpZmFjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUVsQywrQ0FBbUQ7QUFDbkQsb0RBQWlJO0FBQ2pJLGtDQUE0QjtBQUU1Qix5REFBaUc7QUFJakcsbURBQXdDO0FBQ3hDLHFDQUEwRTtBQUMxRSx1Q0FBOEM7QUFFdkMsS0FBSyxVQUFVLGFBQWEsQ0FBQyxTQUFxQyxFQUFFLFVBQWtDLEVBQUUsT0FBNkI7SUFDMUksSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUkscUJBQUssQ0FBQyxJQUFBLFFBQUMsRUFBQSxVQUFVLEVBQUUsSUFBQSxRQUFDLEVBQUEsU0FBUyxFQUFFLElBQUEsUUFBQyxFQUFBLFFBQVEsRUFBRSxJQUFBLFFBQUMsRUFBQSxZQUFZLEVBQUUsSUFBQSxRQUFDLEVBQUEsU0FBUyxDQUFDLENBQUM7SUFDdkYsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDaEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUNuQyxJQUFJLFFBQVEsWUFBWSxtQkFBUSxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUEseUJBQWdCLEVBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4SCxLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzlDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ2YsSUFBQSxlQUFLLEVBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM5QztZQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssSUFBSSxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7U0FDekw7S0FDRjtJQUVELElBQUEsYUFBRyxFQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLElBQUEsYUFBRyxHQUFFLENBQUM7SUFDTixPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ2xCLENBQUM7QUFsQkQsc0NBa0JDO0FBTU0sS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFnQixFQUFFLFVBQXNCLEVBQUUsVUFBNEIsRUFBRSxlQUF1QjtJQUNuSSxNQUFNLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO0lBQzlELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7SUFDdkQsS0FBSyxNQUFNLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLFVBQVUsRUFBRTtRQUNqRCxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLElBQUEsd0JBQVcsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVqRixJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsSUFBQSxlQUFLLEVBQUMsK0JBQStCLElBQUEscUNBQTRCLEVBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUU3RixNQUFNLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbEIsSUFBQSxhQUFHLEVBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDekIsS0FBSyxNQUFNLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLElBQUksT0FBTyxFQUFFO29CQUN6RCxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO3dCQUM5QyxJQUFBLGFBQUcsRUFBQyxLQUFLLElBQUEscUNBQTRCLEVBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3BGO2lCQUNGO2FBQ0Y7WUFFRCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkQsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdEQ7SUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOEJBQW1CLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDaEksTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQW9CLENBQUM7SUFDOUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxXQUFXLEVBQUU7UUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsUUFBUSxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzlGO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQWpDRCwwQ0FpQ0M7QUFPRCxJQUFLLGtCQU1KO0FBTkQsV0FBSyxrQkFBa0I7SUFDckIsNkRBQUssQ0FBQTtJQUNMLHFFQUFTLENBQUE7SUFDVCx5RUFBVyxDQUFBO0lBQ1gsaUZBQWUsQ0FBQTtJQUNmLHFFQUFTLENBQUE7QUFDWCxDQUFDLEVBTkksa0JBQWtCLEtBQWxCLGtCQUFrQixRQU10QjtBQUVELE1BQU0saUJBQWlCO0lBSVE7SUFIckIsR0FBRyxDQUF3QjtJQUMzQixJQUFJLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO0lBQ2pDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUM1QixZQUE2QixRQUFrQjtRQUFsQixhQUFRLEdBQVIsUUFBUSxDQUFVO0lBQy9DLENBQUM7SUFFTyxlQUFlLENBQUMsWUFBb0IsRUFBRSxJQUF3QjtRQUNwRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO1FBQ3JDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7YUFDdEI7WUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsSUFBd0IsRUFBRSxLQUFhLEVBQUUsWUFBb0IsRUFBRSxNQUFjO1FBQ3pGLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ25DLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN4QzthQUFNO1lBQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSw4QkFBOEIsRUFBRSxDQUFDLENBQUM7U0FDM0c7SUFDSCxDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQWM7UUFDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzdCO2FBQU07WUFDTCxNQUFNLGVBQWUsR0FBRyxJQUFBLFFBQUMsRUFBQSxvQkFBb0IsQ0FBQztZQUM5QyxNQUFNLFdBQVcsR0FBRyxFQUFFLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztZQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxNQUFNLFlBQVksR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDO1lBQ2hELE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFlLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxxQkFBcUIsR0FBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1NBQ3hHO0lBQ0gsQ0FBQztDQUNGO0FBRUQsTUFBTSxtQkFBbUI7SUFDZCxJQUFJLEdBQUcsSUFBSSx1QkFBUSxDQUFDO1FBQzNCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGVBQWUsRUFBRSxHQUFHO1FBQ3BCLGlCQUFpQixFQUFFLEdBQUc7UUFDdEIsU0FBUyxFQUFFLEVBQUU7S0FDZCxDQUFDLENBQUM7SUFDTSxnQkFBZ0IsQ0FBYTtJQUM3QixtQkFBbUIsQ0FBcUI7SUFFakQsWUFBWSxrQkFBMEI7UUFDcEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxrQkFBa0Isa0JBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakssSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUUsV0FBbUI7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsSUFBWSxFQUFFLE9BQWU7UUFDOUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFBLFFBQUMsRUFBQSxXQUFXLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFRLEVBQUUsV0FBbUIsRUFBRSxPQUFlO1FBQzdELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBQSxRQUFDLEVBQUEsZUFBZSxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzSSxDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBZTtRQUNoQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUEsUUFBQyxFQUFBLGFBQWEsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELHNCQUFzQixDQUFDLElBQVk7UUFDakMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBRUQsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRXZDLE1BQU0scUJBQXFCO0lBSUk7SUFBcUM7SUFIbEUsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUNsQixnQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFDckIsa0JBQWtCLENBQTZCO0lBQy9DLFlBQTZCLFFBQWtCLEVBQW1CLGtCQUEwQjtRQUEvRCxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQW1CLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtJQUFHLENBQUM7SUFFaEcsZ0JBQWdCLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBRUQsb0JBQW9CLENBQUMsV0FBbUI7UUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBQSxRQUFDLEVBQUEsY0FBYyxXQUFXLEtBQUssQ0FBQyxDQUFDO0lBQ3pILENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxXQUFtQjtRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFBLFFBQUMsRUFBQSxHQUFHLFdBQVcscUJBQXFCLENBQUMsQ0FBQztJQUM5SCxDQUFDO0lBRUQsYUFBYSxDQUFDLElBQWdCLEVBQUUsV0FBbUI7UUFDakQsSUFBSSxVQUFrQixDQUFDO1FBQ3ZCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0wsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUQ7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFBLFFBQUMsRUFBQSxlQUFlLFVBQVUsS0FBSyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDdEcsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQVEsRUFBRSxXQUFtQixFQUFFLE9BQWU7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUNsQyxDQUFDO0lBRUQsdUJBQXVCO1FBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0gsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBZTtRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFBLFFBQUMsRUFBQSxhQUFhLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDRjtBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxPQUFnQixFQUFFLFFBQWlDLEVBQUUsVUFBa0MsRUFBRSxPQUF3RTtJQUN0TSxnREFBZ0Q7SUFDaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDO0lBQzVDLE1BQU0sZ0JBQWdCLEdBQStCLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckssS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUU7UUFDOUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUN4QyxJQUFJLFFBQVEsWUFBWSxtQkFBUSxFQUFFO1lBQ2hDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdkIsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RSxNQUFNLG1CQUFtQixHQUFHLElBQUEseUJBQWdCLEVBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkYsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM5RCxJQUFJO2dCQUNGLE1BQU0sYUFBYSxHQUFHLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ25HLFFBQVEsYUFBYSxFQUFFO29CQUNyQixLQUFLLHdCQUFhLENBQUMsU0FBUzt3QkFDMUIsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVFLE1BQU07b0JBQ1IsS0FBSyx3QkFBYSxDQUFDLGdCQUFnQjt3QkFDakMsTUFBTTtvQkFDUixLQUFLLHdCQUFhLENBQUMsTUFBTTt3QkFDdkIsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQzt3QkFDMUIsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2FBQ0Y7WUFBQyxPQUFPLENBQU0sRUFBRTtnQkFDZixnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUMxQixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2YsSUFBQSxlQUFLLEVBQUMsSUFBQSxRQUFDLEVBQUEsb0JBQW9CLG1CQUFtQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjtLQUNGO0lBRUQsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztJQUMxQixPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFuQ0QsNENBbUNDIn0=
// SIG // Begin signature block
// SIG // MIIoUgYJKoZIhvcNAQcCoIIoQzCCKD8CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // jexLa/xbS7GZkSj0ofTjTuvF2YREB32UVIFXqwUzDJ+g
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
// SIG // gholMIIaIQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAMYRRIXHu78fBZ
// SIG // fc14H6VTQsFQgYGKIWETTNhbT4LiRTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAHlEJcAr9JYem1Zp9rdl3YWEgWmIoCYV
// SIG // 8eTtPHBIucAWoquVVfYaQ6CL3PJnAqb9sq12nKQE9YhB
// SIG // /+L0FVPSbPUJeZyCWz8P+M//alpyRESgO6shYQhU6XSJ
// SIG // RdPjZ8XlNO2lOkK7lNPxt6NdkEnRzDnmJibacMXF4oPJ
// SIG // Ztm4pHOHjRnJjQGfkBK5p/ub8tFeTGt9lNZalG6QSXoX
// SIG // ytbucxO2POwR5aEDUzcdtpsQglV/aRTLXjrmhtF+eZVu
// SIG // hVVNBqRHll5i/EudgpSJZgdbfrJRtdlbucdecCC+TEDG
// SIG // 5geDWi6PVdI/bAhaYj/qb8RIE0hwH7U9WaVBQOVWLIKB
// SIG // fsyhghevMIIXqwYKKwYBBAGCNwMDATGCF5swgheXBgkq
// SIG // hkiG9w0BBwKggheIMIIXhAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // KqEu1aseRFGiaAzcGh648ox4j+xnf0yt+SS2m3HQPtUC
// SIG // Bme2HeQT3xgTMjAyNTA0MDExOTU5NDQuNTA4WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NDMxQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH9MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfr7O0TTdzPG0wABAAAB+jANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMTFaFw0yNTEwMjIxODMx
// SIG // MTFaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo0
// SIG // MzFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBAMoWVQTNz2XAXxKQH+3y
// SIG // CIcoMGFVT+uFEnmW0pUUd6byXm72tC0Ag1uOcjq7acCK
// SIG // Rsgxl/hGwmx4UuU3eCdGJXPN87SxG20A+zOpKkdF4/p/
// SIG // NnBrHv0JzB9FkWS58IICXXp6UOlHIjOJzGGb3UI8mwOK
// SIG // noznvWNO9yZV791SG3ZEB9iRsk/KAfy7Lzy/5AJyeOaE
// SIG // CKe0see0T0P9Duqmsidkia8HIwPGrjHQJ2SjosRZc6KK
// SIG // Ie0ssnCOwRDR06ZFSq0VeWHpUb1jU4NaR+BAtijtm8bA
// SIG // Tdt27THk72RYnhiK/g/Jn9ZUELNB7f7TDlXWodeLe2JP
// SIG // sZeT+E8N8XwBoB7L7GuroK8cJik019ZKlx+VwncN01Xi
// SIG // gmseiVfsoDOYtTa6CSsAQltdT8ItM/5IvdGXjul3xBPZ
// SIG // gpyZu+kHMYt7Z1v2P92bpikOl/4lSCaOy5NGf6QE0cAC
// SIG // DasHb86XbV9oTiYm+BkfIrNm6SpLNOBrq38Hlj5/c+o2
// SIG // OxgQvo7PKUsBnsK338IAGzSpvNmQxb6gRkEFScCB0l6Y
// SIG // 5Evht/XsmDhtq3CCwSA5c1MzBRSWzYebQ79xnidxCrwu
// SIG // LzUgMbRn2hv5kISuN2I3r7Ae9i6LlO/K8bTYbjF0s2h6
// SIG // uXxYht83LGB2muPsPmJjK4UxMw+EgIrId+QY6Fz9T9Qr
// SIG // eFWtAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUY4xymy+V
// SIG // lepHdOiqHEB6YSvVP78wHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBALhW
// SIG // wqKxa76HRvmTSR92Pjc+UKVMrUFTmzsmBa4HBq8aujFG
// SIG // uMi5sTeMVnS9ZMoGluQTmd8QZT2O1abn+W+Xmlz+6kau
// SIG // tcXjq193+uJBoklqEYvRCWsCVgsyX1EEU4Qy+M8SNqWH
// SIG // NcJz6e0OveWx6sGdNnmjgbnYfyHxJBntDn4+iEt6MmbC
// SIG // T9cmrXJuJAaiB+nW9fsHjOKuOjYQHwH9O9MxehfiKVB8
// SIG // obTG0IOfkB3zrsgc67euwojCUinCd5zFcnzZZ7+sr7bW
// SIG // Myyt8EvtEMCVImy2CTCOhRnErkcSpaukYzoSvS90Do4d
// SIG // FQjNdaxzNdWZjdHriW2wQlX0BLnzizZBvPDBQlDRNdEk
// SIG // mzPzoPwm05KNDOcG1b0Cegqiyo7R0qHqABj3nl9uH+XD
// SIG // 2Mk3CpWzOi6FHTtj+SUnSObNSRfzp+i4lE+dGnaUbLWW
// SIG // o22BHl/ze0b0m5J9HYw9wb09jn91n/YCHmkCB279Sdjv
// SIG // z+UDj0IlaPPtACpujNEyjnbooYSsQLf+mMpNexb90SHY
// SIG // 0+sIi9qkSBLIDiad3yC8OJkET7t7KUX2pEqEHuTdHuB1
// SIG // hX/FltmS9PnPN0M4d1bRDyOmNntgTv3loU2GyGx6amA3
// SIG // wLQGLWmCHXvO2cplxtzDtsFI4S/R70kM46KrqvjqFJr3
// SIG // wVHAdnuS+kAhzuqkzu1qMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCA1gwggJAAgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NDMxQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAPeG
// SIG // fm1CZ/pysAbyCOrINDcu2jw2oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlqaWMCIYDzIwMjUwNDAxMTc1MzI2WhgPMjAy
// SIG // NTA0MDIxNzUzMjZaMHYwPAYKKwYBBAGEWQoEATEuMCww
// SIG // CgIFAOuWppYCAQAwCQIBAAIBUAIB/zAHAgEAAgITzDAK
// SIG // AgUA65f4FgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgor
// SIG // BgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYag
// SIG // MA0GCSqGSIb3DQEBCwUAA4IBAQCizUHpkLniqcOQ4zjv
// SIG // v1wbnQGQJxRVnh916ef2q8B65xCFPcdkouWJdqNnn8es
// SIG // Jfq5THYZ/IXX8GeJ78kycUvIOKIyZTfm4skEilRDoPag
// SIG // oEcc5+BZeCWt9I7UfhyMU4t921wpvYSA35oazXdjDqUb
// SIG // vxZ44n0XdRQPK19FpOzHM91Av//NXapgsqnysdYZ+52/
// SIG // UjhVneItsFeXk5hpgFYAUJKo2ikExYU3FvQIfYqRUSDI
// SIG // m/5CX0Y8GjykwSRjvjDeSA8oTjI7bav47b3aURCWPIMR
// SIG // VfhmUHRSbAZvpMkRrisXEy3F6zQbaLbYLNJjGp2LwXQX
// SIG // PMKmW/yaZ/nZv5e1MYIEDTCCBAkCAQEwgZMwfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAH6+ztE03cz
// SIG // xtMAAQAAAfowDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqG
// SIG // SIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0B
// SIG // CQQxIgQgfdu4VzYbRn9nJxV615ejy0KiRxFTlHiFIiPL
// SIG // CJa4LtIwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9
// SIG // BCB98n8tya8+B2jjU/dpJRIwHwHHpco5ogNStYocbkOe
// SIG // VjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAAB+vs7RNN3M8bTAAEAAAH6MCIEIHET/s6N
// SIG // qQyC9bS4mryIsccEpxZBcZX3PurFe7E+39QzMA0GCSqG
// SIG // SIb3DQEBCwUABIICAC8T3SeFYEeYYDqD9wlXXNwV+eWI
// SIG // gzJORT1SJg87WbQEN14+U6XMlhmxPnKo+9rvUKwvvYyv
// SIG // Tcx2KhUCfbJpk3uz+Q7Lvw7tZvh/QG98D+7dRtfaD3Fs
// SIG // muagqL/ZtxKqbBM7FMyKsntJ8QC4sc7fZzoYA8NZsaHf
// SIG // gJAvR9zaqqOWkG6h8PwMi2gmGEr0abf87TSdUfmdqqTj
// SIG // G9/hhn0Av3E5gdgPypMDRr9gyO3Fh7iN/C64yfWNHlfs
// SIG // zvEDAViaisfNhTs5L4qBxx3B8qVUZJRG3xImZa/zD/Y4
// SIG // aEqmKUg7RyiMvaW/QqPUm46XcRNV9J4Eml06bZAYzUiI
// SIG // WNlY50reTSbvCWgdfDqEpNxbPQafy3JcrCHc+ePfg3Oe
// SIG // oL/TudG4OuivkTgnk8/cK/n660Ai8PldBdyKEtpg/N9c
// SIG // e6AUUjZCRvO9fHSj6VcD6+mYXyNXXuA79HDsGeOqUy8t
// SIG // jBTh8jKkQDgNvdYwCMq0zAz7A5NHJNcGXgUQwTQ/lE12
// SIG // u6tb8YgrrSA53PZMUeStwC8ftFub3V57/Yza1X4G4KYY
// SIG // M1+X2aX7KSi1xFxVq0iC7zjU1SZ1ELYhF1NSf+k0m/hD
// SIG // kPa/ijKLz8mkQDbIKgb+juem8Im2iGBXEtTC9NT3F4W6
// SIG // MQFzx+6I4PDRjXjDuenKTUqM067MhQlSjE/LUyDf
// SIG // End signature block
