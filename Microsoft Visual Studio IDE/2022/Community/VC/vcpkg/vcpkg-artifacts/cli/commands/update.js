"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommand = void 0;
const artifact_1 = require("../../artifacts/artifact");
const unified_filesystem_1 = require("../../fs/unified-filesystem");
const i18n_1 = require("../../i18n");
const main_1 = require("../../main");
const RemoteRegistry_1 = require("../../registries/RemoteRegistry");
const exceptions_1 = require("../../util/exceptions");
const command_1 = require("../command");
const format_1 = require("../format");
const styling_1 = require("../styling");
const all_1 = require("../switches/all");
const project_1 = require("../switches/project");
async function updateRegistry(registry, displayName) {
    try {
        await registry.update(displayName);
        await registry.load();
        (0, styling_1.log)((0, i18n_1.i) `Updated ${displayName}. It contains ${(0, format_1.count)(registry.count)} metadata files.`);
    }
    catch (e) {
        if (e instanceof exceptions_1.RemoteFileUnavailable) {
            (0, styling_1.log)((0, i18n_1.i) `Unable to download ${displayName}.`);
        }
        else {
            (0, styling_1.log)((0, i18n_1.i) `${displayName} could not be updated; it could be malformed.`);
            (0, styling_1.writeException)(e);
        }
        return false;
    }
    return true;
}
class UpdateCommand extends command_1.Command {
    command = 'update';
    project = new project_1.Project(this);
    all = new all_1.All(this);
    async run() {
        const resolver = main_1.session.globalRegistryResolver.with(await (0, artifact_1.buildRegistryResolver)(main_1.session, (await this.project.manifest)?.metadata.registries));
        if (this.all.active) {
            for (const registryUri of main_1.session.registryDatabase.getAllUris()) {
                if ((0, unified_filesystem_1.schemeOf)(registryUri) != 'https') {
                    continue;
                }
                const parsed = main_1.session.fileSystem.parseUri(registryUri);
                const displayName = resolver.getRegistryDisplayName(parsed);
                const loaded = resolver.getRegistryByUri(parsed);
                if (loaded) {
                    if (!await updateRegistry(loaded, displayName)) {
                        return false;
                    }
                }
            }
        }
        for (const registryInput of this.inputs) {
            const registryByName = resolver.getRegistryByName(registryInput);
            if (registryByName) {
                // if it matched a name, it's a name
                if (!await updateRegistry(registryByName, registryInput)) {
                    return false;
                }
                continue;
            }
            const scheme = (0, unified_filesystem_1.schemeOf)(registryInput);
            switch (scheme) {
                case 'https':
                    const registryInputAsUri = main_1.session.fileSystem.parseUri(registryInput);
                    const registryByUri = resolver.getRegistryByUri(registryInputAsUri)
                        ?? new RemoteRegistry_1.RemoteRegistry(main_1.session, registryInputAsUri);
                    if (!await updateRegistry(registryByUri, resolver.getRegistryDisplayName(registryInputAsUri))) {
                        return false;
                    }
                    continue;
                case 'file':
                    (0, styling_1.error)((0, i18n_1.i) `The x-update-registry command downloads new registry information and thus cannot be used with local registries. Did you mean x-regenerate ${registryInput}?`);
                    return false;
            }
            (0, styling_1.error)((0, i18n_1.i) `Unable to find registry ${registryInput}.`);
            return false;
        }
        return true;
    }
}
exports.UpdateCommand = UpdateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImNsaS9jb21tYW5kcy91cGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUVsQyx1REFBaUU7QUFDakUsb0VBQXVEO0FBQ3ZELHFDQUErQjtBQUMvQixxQ0FBcUM7QUFDckMsb0VBQWlFO0FBRWpFLHNEQUE4RDtBQUM5RCx3Q0FBcUM7QUFDckMsc0NBQWtDO0FBQ2xDLHdDQUF3RDtBQUN4RCx5Q0FBc0M7QUFDdEMsaURBQThDO0FBRTlDLEtBQUssVUFBVSxjQUFjLENBQUMsUUFBa0IsRUFBRSxXQUFtQjtJQUNuRSxJQUFJO1FBQ0YsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLElBQUEsYUFBRyxFQUFDLElBQUEsUUFBQyxFQUFBLFdBQVcsV0FBVyxpQkFBaUIsSUFBQSxjQUFLLEVBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3RGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFJLENBQUMsWUFBWSxrQ0FBcUIsRUFBRTtZQUN0QyxJQUFBLGFBQUcsRUFBQyxJQUFBLFFBQUMsRUFBQSxzQkFBc0IsV0FBVyxHQUFHLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBQ0wsSUFBQSxhQUFHLEVBQUMsSUFBQSxRQUFDLEVBQUEsR0FBRyxXQUFXLCtDQUErQyxDQUFDLENBQUM7WUFDcEUsSUFBQSx3QkFBYyxFQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25CO1FBRUQsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQWEsYUFB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
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // +DZWCkZlgpgDUkVJ5kxSRZlqs2FRYWOFWDxmjOvglIWg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBxx9a/OhM7uOct
// SIG // 6Zh6a/jw/7M5rZpW2uacxuo6sVIMDTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAHqwXoMJvtTIsH02UpExwB0F5jAh2Es0
// SIG // k+/i2vKMLVAFGWhqVTQn4PMkVtqX3x2b2fQ5QxwU0sA3
// SIG // gmpyBXFGMCq8LAfYYJKoydiu2e+dE/6nApwj+uz2BPd5
// SIG // pDEWLM2qQfLXBnfXezi+LA1wnEkn9jPBkiZeJ927U31O
// SIG // +2GDHIxCu1DsIu32AAnny4m4X+Zz96mZQ6pqaT7GoXd+
// SIG // 1p75R0v/ufe+qMSXOyw4qBavHUP/S3uY8IMPfUnFZJ4Q
// SIG // sRY/krYlP05czWwBlhCpo5sv8lg5/CfmOgBI2ADlHZz8
// SIG // JfA2IVO6EZPG5X5PtgWwYLTHNRX72NUKgvJoKx58tAMW
// SIG // 4CKhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // aBi/tG9unvLFijjzpYl7y3W1S8EbR3vMZuIiPxSVUrAC
// SIG // BmfcEYDHyRgTMjAyNTA0MDExOTU5MDkuMTM4WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjkyMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAIJCAfg+VyM5lUAAQAAAgkwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjU1WhcNMjYwNDIyMTk0MjU1WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjkyMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAwpRKMPcuDN39Uvc9cbTRBE8Fi9bxIosNKA+0lxHb
// SIG // +LHT9MbFconb+iNq5hJfD2LPS3GY87FjhyO3UJES9vBj
// SIG // 9wl3L2NGaup1rB2NkGpgmRSxdiJUR+gR8dkZDe2UQypr
// SIG // OwTqOCBgUZQjJFL/Tff7cDswJKVjbDN2/wUMXMIVYLEK
// SIG // rUPDRD1Lokfhlea3UB1E+KY4oWU5CcK2pYs9GW2KVEx+
// SIG // TpIt3dwacfaoj64geoYTXxj45dDyKdtw+e/a6VumZj6j
// SIG // 0/I9dil+8kmcDbsbNz2Lxf8NdxrEV5MyGyMiyhD84/Zc
// SIG // 5pqxdsI771K8fQGcOxi0l5NvA59V0n+toW5BblBsDxS6
// SIG // dxG0aiFZgWeNsHM+ZkiCAst0LP4cIRGIVJ3ZwAYDaQ+W
// SIG // rwCzle7FHyaxw2V1+n/YIG4yAOo9p4UgEiKpfBeS7Cgc
// SIG // NET7Q7st49gj8bU5maM2yyvEzLcQ4jAoMU6X4OYmFL8o
// SIG // VeGqmgy8EQbKAUYTv/ocMmyp2MF8Snnjq7DsEC52jhOQ
// SIG // ZhSWFgThc93fPCwSvUEQYHRB+Qi1Ye8JIDCHofenB+fh
// SIG // 9MRL5oOre7s7ZV19kle8XVGD8QN7441dxJFe2m0hw+Rx
// SIG // 0GU63dxarA/1TmAAlFQT68RfpFK2Rl8WCJ2U6a2DGBKu
// SIG // lCBtQ0+KQlT/Q3GgixiDmBCdYNMCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBRJi+jRxF045b3wL0DNtXczFpPK0jAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAXF58bzg8JOIf421AbJxZRba0
// SIG // rgQWW+8EmX2uZSkTEzXzZZmgAuG3e1qNCOYTMbBCVMrq
// SIG // R8IeJA+apEWXMyHNIyAAUENcQ1AWvlk8a6f1AKgte4ox
// SIG // Qnj2SmFYzax3/wZo8+xWjiONZMbnkYcCzSHENoJgag0e
// SIG // VuE0tobUSWMmQLO43yZmw7U3FDjIRJdTlpcfxZ73EG6L
// SIG // eVT82lMIk+jYnvJej2Y6ELLsYmrLkgJsSiEHbB5yeUKJ
// SIG // KsHcql4tRWQ7RE1b213w7KH807WuHp9qn+PIcxGcFL25
// SIG // M+bJrfPdJ1QCu5M9nK68zd4aZ3xbn7af61y1k78T0HH1
// SIG // l4hLiFHdhoO3kfELcirSQ1PPjw8BApM6GiY2xgiqsfRE
// SIG // oBSc861zcIYV+kXPINhFP/ut5pqlnghf5CThYNnicO2r
// SIG // v2mxEoKtxGs8g9VZS/h2l/jARxs0Jh7bzpt0JeMFUzd1
// SIG // qvF/GwkevKoheaxWrJuEcRes2o2Xkhwv6kud9+v+GjA6
// SIG // rFejvOkZTzwmBiTj7X9jGyju1ySXi/1EDdHN7oseUTE6
// SIG // OunWwE8T1BRBuT4eDx8xo1GxDuw9+S7hAYohvGK5TETp
// SIG // Bpd3wUJfW1m4MPQiFEG8KuXE2hMZXxKTHUqMnSaJVE0A
// SIG // +RCyhs9UyWoU4nXdtMJcIuQZN+lyJs7B+GLNeYl0XwIw
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
// SIG // Tjo5MjAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAfO+tqz00HeyJwwkHW9ZIBSkJAkSggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWYO8wIhgPMjAyNTA0MDExMjU2
// SIG // MTVaGA8yMDI1MDQwMjEyNTYxNVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65Zg7wIBADAHAgEAAgIRvzAHAgEA
// SIG // AgISEzAKAgUA65eybwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBVq4//Rja6
// SIG // FkUKTQIFy1yDbppKlwHmFWt/K5WjY1ix34rrFZMWScRb
// SIG // ElibGFAZ8e4cfYQHZwGI5BLick+5UHartpW5Fuad4u/k
// SIG // OP4BimuXd7G4mslLnIQBXxMnPjwkoDf5LPzi6Z/ss7tM
// SIG // IAWu8EQhbvjQssv+0XrT4Z1/SD7jtDZkQUIAA3ssGX/6
// SIG // oy2Na33zkUpCDlLmFdm5Hyy+FFmDTGObUFcSSJGjEZ9t
// SIG // CuP0gBvEH1G/weHrjF1D+zN/uT/O/af9NfWoJnX9L0NH
// SIG // vgtx6hHzT6bUiCz+n6MiHKfjUWnR4qEfcybykgPgDlyL
// SIG // uxSam1L1iPBpE98uOQswB9IWMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIJ
// SIG // CAfg+VyM5lUAAQAAAgkwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQg5h6pnrwDUJZ7z5PgugW//eO6iB8s
// SIG // 2duVbppm9AWHoeEwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBoGyweyL30Ai5lDlGYY3VKivG4pHwemVVX
// SIG // aE4zcIUTPjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACCQgH4PlcjOZVAAEAAAIJMCIE
// SIG // ICpBN6s2Xmyn5rwFa7LgwQLE0qkLo1zRcrc1we6F53SP
// SIG // MA0GCSqGSIb3DQEBCwUABIICAJHt6fhvmUb1Xgfbgh3c
// SIG // Y9iQ/PvwKzkcdV9YU+HFrdsfO1jaORfjDoiJVFXNacA5
// SIG // 49Oj1eOzdCPDvZjjkZuCkoi9CYKuSUGD90sRCh9eEMDh
// SIG // OM0TSx08F71UzM/79kdq2WIUoO+f72MtHvmwoHVCc3Qk
// SIG // 5mS8OuccbkGugycSZHetxFcKK1S58fiAKA4+KQw0AAk1
// SIG // p1QbXgUZqcYCZN0HToJ62QMKSLQDI+sG/vgNAluEgMZj
// SIG // pvkGucofgBEa1rlE3zBR5MCr+/3mEr47Lrm1C+NqcgNj
// SIG // FT0Zzb/plXPYUivFTxFeuUU03jUMRCRwL/mtzf6fq6bc
// SIG // bEsVvABqDGjtfXH8zsqMkEABeTtUHHxALfwiHulhkIg4
// SIG // gAmYOcGCscMolmNS1f/N5Tcv5Xr93bryw0eQU/DY6MKh
// SIG // Kz8kvjQUG0G9185F9lvHcgzZ/epW03r3NSRC9KDfrLg/
// SIG // l/uYqWGyYMNw3bf5XjKZmgSQ+vwI1GEPALbBZ7Z6UKFD
// SIG // IJ6xjWTtfHpjvzpvsvcWYLtkomr5r6pJDlWW5zz813Y4
// SIG // jPtgl+TNvmlrMLlSIsfGo3PMq1Zpd0jpsflKlX23t7Y2
// SIG // 6mQrZ7MehgwYLXFoX8lJMMMZJA50vh8jOhG8B7aDJzll
// SIG // jejY8v7e6/jFA49xE5zYcEZiV7thaSOWeVQqfRdQWb81
// SIG // k9tD
// SIG // End signature block
