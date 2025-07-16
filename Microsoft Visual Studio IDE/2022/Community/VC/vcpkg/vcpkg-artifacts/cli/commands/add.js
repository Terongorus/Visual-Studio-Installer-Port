"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommand = void 0;
const artifact_1 = require("../../artifacts/artifact");
const i18n_1 = require("../../i18n");
const main_1 = require("../../main");
const artifacts_1 = require("../artifacts");
const command_1 = require("../command");
const format_1 = require("../format");
const styling_1 = require("../styling");
const project_1 = require("../switches/project");
const version_1 = require("../switches/version");
class AddCommand extends command_1.Command {
    command = 'add';
    version = new version_1.Version(this);
    project = new project_1.Project(this);
    async run() {
        const projectManifest = await this.project.manifest;
        if (!projectManifest) {
            (0, styling_1.error)((0, i18n_1.i) `Unable to find project in folder (or parent folders) for ${main_1.session.currentDirectory.fsPath}`);
            return false;
        }
        if (this.inputs.length === 0) {
            (0, styling_1.error)((0, i18n_1.i) `No artifacts specified`);
            return false;
        }
        const versions = this.version.values;
        if (versions.length && this.inputs.length !== versions.length) {
            (0, styling_1.error)((0, i18n_1.i) `Multiple artifacts specified, but not an equal number of ${(0, format_1.cmdSwitch)('version')} switches`);
            return false;
        }
        const selections = new Map(this.inputs.map((v, i) => [v, versions[i] || '*']));
        const projectResolver = await (0, artifact_1.buildRegistryResolver)(main_1.session, projectManifest.metadata.registries);
        const combinedResolver = main_1.session.globalRegistryResolver.with(projectResolver);
        const selectedArtifacts = await (0, artifacts_1.selectArtifacts)(main_1.session, selections, combinedResolver, 2);
        if (!selectedArtifacts) {
            return false;
        }
        await (0, artifacts_1.showArtifacts)(selectedArtifacts, combinedResolver);
        for (const resolution of selectedArtifacts) {
            // map the registry of the found artifact to the registries already in the project file
            const artifact = resolution.artifact;
            if (resolution.initialSelection && artifact instanceof artifact_1.Artifact) {
                const registryUri = artifact.metadata.registryUri;
                let registryName = projectResolver.getRegistryName(registryUri);
                if (!registryName) {
                    // the registry isn't known yet to the project, try to declare it
                    registryName = main_1.session.globalRegistryResolver.getRegistryName(registryUri);
                    if (!registryName) {
                        throw new Error((0, i18n_1.i) `Tried to add an artifact [${registryUri.toString()}]:${artifact.id} but could not determine the registry to use.`);
                    }
                    const conflictingRegistry = projectResolver.getRegistryByName(registryName);
                    if (conflictingRegistry) {
                        throw new Error((0, i18n_1.i) `Tried to add registry ${registryName} as ${registryUri.toString()}, but it was already ${conflictingRegistry.location.toString()}. Please add ${registryUri.toString()} to this project manually and reattempt.`);
                    }
                    projectManifest.metadata.registries.add(registryName, artifact.registryUri, 'artifact');
                    projectResolver.add(registryUri, registryName);
                }
                // add the artifact to the project
                const fulfilled = artifact.version.toString();
                const requested = resolution.requestedVersion;
                const v = requested !== fulfilled ? `${requested} ${fulfilled}` : fulfilled;
                projectManifest.metadata.requires.set(`${registryName}:${artifact.id}`, v);
            }
        }
        // write the file out.
        await projectManifest.metadata.save();
        main_1.session.channels.message((0, i18n_1.i) `Run \`vcpkg-shell activate\` to apply to the current terminal`);
        return true;
    }
}
exports.AddCommand = AddCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImNsaS9jb21tYW5kcy9hZGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUVsQyx1REFBMkU7QUFDM0UscUNBQStCO0FBQy9CLHFDQUFxQztBQUNyQyw0Q0FBOEQ7QUFDOUQsd0NBQXFDO0FBQ3JDLHNDQUFzQztBQUN0Qyx3Q0FBbUM7QUFDbkMsaURBQThDO0FBQzlDLGlEQUE4QztBQUU5QyxNQUFhLFVBQVcsU0FBUSxpQkFBTztJQUM1QixPQUFPLEdBQUcsS0FBSyxDQUFDO0lBRXpCLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsT0FBTyxHQUFZLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU1QixLQUFLLENBQUMsR0FBRztRQUNoQixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBRXBELElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsSUFBQSxlQUFLLEVBQUMsSUFBQSxRQUFDLEVBQUEsNERBQTRELGNBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM1QixJQUFBLGVBQUssRUFBQyxJQUFBLFFBQUMsRUFBQSx3QkFBd0IsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxD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
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // RUnrqKJb2XLmNn8Mhe7rjT/syT68FMaPI7+UeebNmLKg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAF6McejvnB3yde
// SIG // Gk12Y87+MHMWbbvBUrhzPrkX16Dk/DBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAIrZS9cjK845CmOtDDUt2mBqrq2YhQkK
// SIG // lu0PDykXyrEu2dXHsiHQXsuFCSU1S5xj55yf+qdZmt6i
// SIG // h99F3HDw9WchnXZk+nScpdvU+GVYsvsL3EO2hHeTO6o8
// SIG // RfwOItntWqtHkmbIq8RMKYRhNNATkf+Zpjm+eX3f9L6p
// SIG // Q9R6XC/Af4qhTT86nITnStp6Ku9xIT+7hlb0zEph+2Ce
// SIG // gCnmAkDPD6wfjZR+SGKaMlkkvb5SarVmGUPBfukG+p9W
// SIG // vR1FBLwT4wWXgu/RwcLjr47wJAVEzazzuKmmzRLDuN1D
// SIG // yfYmxmUH9BoxcW+iC8ig3/leHnVQa7V40TqHXxcuELea
// SIG // wNuhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // G1Gjx20mVolUMV64r024oqNKDfUF61aa2tw1KWKt5goC
// SIG // BmfcB9bDFBgTMjAyNTA0MDExOTU5MDIuNDI1WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkE5MzUt
// SIG // MDNFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAIMuWTjNZzs9K4AAQAAAgwwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MzAwWhcNMjYwNDIyMTk0MzAwWjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkE5MzUtMDNFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAygFWJj3kbYGv1Oo86sqiw9DAKKJdt4HATefPmf17
// SIG // JGMDSbGfjvsFckGJfHT0ytfwQtsQInNZvib3JKo1WkN9
// SIG // iplEbBGaLYq0GODylVvnl8Ebd6+rM4C7onOqqB5W16Mf
// SIG // 5dBybYFEZMw11jJCphki+8/P3K6nL5mKr/Lf7JQBeCfp
// SIG // qc2/bTBVZo8ClzjVXUcIPUN1mj2QQu1r6Iuz0SDdo4I0
// SIG // gZx2MgGUpbLSja6WG+vhruqEhZEMxqUeufkDQ3ZD+Lnz
// SIG // n+D2zoN32+Lhj4yPBDypacDMGotZEMl/n4HIAqFfSfqP
// SIG // DGGAmVHrd5M4YcEc6oeizHg42lyz+9NUl14l3NmR87gx
// SIG // 20v7GbSd+tu3FaQpVxCFL4Nsaa9Kz5SLR8LY6NT8DAqV
// SIG // 2Kp2Cr1/GifJ2sE/VvBVLrsmTxtfOdvquI5FZXii+8fu
// SIG // 3pfBE3oW3ZMHYQF8l4pmhM1nrTTUphvynxwKfXM8LC9b
// SIG // yq+EYJ/qSCJGR7qJnX+XuPNSvsSFoSwj3ablfOxKhjiv
// SIG // 424Tp2RKsHbwNAJTGi37JgnpmZrqXo2mLhJNOf+nAlMY
// SIG // BeMwp5CXmHTAD/vWeJFYe7c0RbMP5WUpdg+xISAOip4+
// SIG // kX3x9pO2LUhkr/Ogkoc34l2s/curE7vEhqhejmy/3rvw
// SIG // 5Ir8laAn1F1i44kibK0utw9BBx0CAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBR1DkUh/7Af60P23g9JeVcUO9OhiDAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEA2TD6+IFZsMH+BjAeWXx0q9+L
// SIG // oboOss7uB1E/iVjGas/boS2QaF+Qj43Sic8AFb2KDbi5
// SIG // ktPvZQOUu+K7yqnf7vb6fPFRpOlO4DHHmrXaqSpW1UXZ
// SIG // 9mX6zHKSOMznOgbbmK8yVeHBLNWJl/ebogMWhA9+MNNg
// SIG // Z37j2VwNHnbAwW3eIsRVPF/9SdA3yFJNWBWDzq5sJiNp
// SIG // Neruk3CjtGKUZcE3QqvbztHhCBEdUi5kDQc1/YdnHAr7
// SIG // YHpDmgaCEN2UWovA7NX/sHCgj8w+Kg198TYLyxYiqAOm
// SIG // UhvUv8jqxmokhiHg8uTfVULqkzY68rgM473+VvAEKd9Y
// SIG // VdRm1AzpG1HXfs5CVil+BZs3njedhBG8pKFnCeVfTOAz
// SIG // xjecaRal8vWjtPnUdFFGFrqni4Q8kZ1XmXExLtMYJqPq
// SIG // UB2rhVQErFTkTKfExfHaXrHfrapJEPFTbyNtKDn503y/
// SIG // u2YFDH+6jVdJZdFqOZ5a9Qib2tW35Nh3OQWNTPbHd25Q
// SIG // ZHs8ryT5+I9G3zjqwmE8GLDbI4kZf1ltfDTqYsKnIsBZ
// SIG // VDarVgkTMwva/OGGlDEPNgcsJOPHeLgaJ+WQPKV10u48
// SIG // CU4yY+VEnkZfb40/fDw2cghTtnhUjhXQ3X+lgaP1mVAN
// SIG // oRmdKvie49eNH21wnzlCJtI9tx2gFdHJA0v55gv6BdYw
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
// SIG // TjpBOTM1LTAzRTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUA77vIZIRDLeWfC3Xn5bO89S1VPKaggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWV0MwIhgPMjAyNTA0MDExMjE0
// SIG // NTlaGA8yMDI1MDQwMjEyMTQ1OVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65ZXQwIBADAHAgEAAgIahDAHAgEA
// SIG // AgIStjAKAgUA65eowwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQB2OO1apd43
// SIG // yP2Rj1G/EVC2wGUPOjD3L/wzIRxrQz5YVex2DmwGlOQN
// SIG // r7jXNMk5xiPnIF27tlNO846oHLsR5ZKcH4PLpWofFeF4
// SIG // OFzuGT0HT7lVzE90//xiQ4U8ipDnzL5808KTSw6lyDBc
// SIG // g+VSR0Oz8uBVKOxC9TFDIRNX0n97REBTxlITyrvuy6F8
// SIG // R+SgrGAUyG5Wv2ShWY+CBaX6URouvRVWawgbjJCIpibU
// SIG // GUGFEEwYDnnkxVlD9eudAC0huxBlo92qnmTO1JMSqi5m
// SIG // pK21NJNxNBZUwxka3zXYY5BYw9201J077bd7XoDEk87L
// SIG // FJF1v4SXlGzYzueYKTxsWTKGMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIM
// SIG // uWTjNZzs9K4AAQAAAgwwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgkFj2OvA5Sf4Dj/bC2ByBDgiuZwX7
// SIG // YbVxkRh4sguJ2OQwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCDVKNe3BTGTeOjCOTXyAIPVMeXDucTPYp63
// SIG // ua4rjmfCLTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACDLlk4zWc7PSuAAEAAAIMMCIE
// SIG // IMsqPRvq76xkHIFnwEZ5jDrovgqudHDvTUdDZM63sotN
// SIG // MA0GCSqGSIb3DQEBCwUABIICAJG5GkpzhIPql+1o3cE8
// SIG // /uMpidP27Eq+rqltYCA/JsfR90CZ8S/ek5PRdnjk0NF6
// SIG // f4Tp38dgop6ZzbJ8Da7F/8DHLZybfLGeODib2Jb789iw
// SIG // sd86gLCminuEo7Ii3gu+7KlApL6n+hlUAx73Vr2cSS3o
// SIG // qaOGxkA3q3prCSSfxov9Uf76XEM37HW1kXLKD7rBGkmM
// SIG // r8nkP6NfMJbRCvSZMbJukI7h6I3fMMGZDQacm1jcAubs
// SIG // voDS/XwikZLKftNcDt6LtSUQcOCiDh4UKZ3duzUwY5PQ
// SIG // yamJ5j9p9dfDQULgCcbjoeUBvINeBTow99zKiogEhO26
// SIG // RL+7A7Wi586j9U4f6l1SuaY+qXvFzXAE1Qt7J/c0AQwb
// SIG // 2uN8WRJpWK9yzT71B+RUmURPPT4U3plkJ4nMlIK5mfgy
// SIG // 3iopXAWZI/acULFPgZQGrlvLIi2PQGJlqayUSA7pDphy
// SIG // nGOhXX+tBYGaO7rQdUTvg6BTxl6W4HcUVuG52cNVvS6q
// SIG // twEEgWPHL1WwgYbGVEqOLVbSIISartzua8jWvcO87oR/
// SIG // h5FmMKQObfrD7d0U68GBaZwkKf2WYW8TDme3sqEKEi4b
// SIG // OPSmwOXyuPPucNjJ2FNeKTUfadjmfHTccrVQZ+9wUMK3
// SIG // foXptGHUdbYngYOhsRCY6dgTVnduCxiVl/Mlz/fB9wcC
// SIG // Em9S
// SIG // End signature block
