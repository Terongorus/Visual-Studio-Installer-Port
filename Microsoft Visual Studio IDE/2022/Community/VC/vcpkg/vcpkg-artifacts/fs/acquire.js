"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireNugetFile = exports.resolveNugetUrl = exports.acquireArtifactFile = void 0;
const assert_1 = require("assert");
const i18n_1 = require("../i18n");
const exceptions_1 = require("../util/exceptions");
const vcpkg_1 = require("../vcpkg");
async function acquireArtifactFile(session, uris, outputFilename, events, options) {
    await session.downloads.createDirectory();
    session.channels.debug(`Acquire file '${outputFilename}' from [${uris.map(each => each.toString()).join(',')}]`);
    // is the file present on a local filesystem?
    for (const uri of uris) {
        if (uri.isLocal) {
            // we have a local file
            if (options?.algorithm && options?.value) {
                // we have a hash.
                // is it valid?
                if (await uri.hashValid(events, options)) {
                    session.channels.debug(`Local file matched hash: ${uri.fsPath}`);
                    return uri;
                }
            }
            else if (await uri.exists()) {
                // we don't have a hash, but the file is local, and it exists.
                // we have to return it
                session.channels.debug(`Using local file (no hash, unable to verify): ${uri.fsPath}`);
                return uri;
            }
            // do we have a filename
        }
    }
    // we don't have a local file
    // https is all that we know at the moment.
    const webUris = uris.where(each => each.isHttps);
    if (webUris.length === 0) {
        // wait, no web uris?
        throw new exceptions_1.RemoteFileUnavailable(uris);
    }
    return https(session, webUris, outputFilename, events, options);
}
exports.acquireArtifactFile = acquireArtifactFile;
/** */
async function https(session, uris, outputFilename, events, options) {
    session.channels.debug(`Attempting to download file '${outputFilename}' from [${uris.map(each => each.toString()).join(',')}]`);
    const hashAlgorithm = options?.algorithm;
    const outputFile = session.downloads.join(outputFilename);
    if (options?.force) {
        session.channels.debug(`Acquire '${outputFilename}': force specified, forcing download`);
        // is force specified; delete the current file
        await outputFile.delete();
    }
    else if (hashAlgorithm) {
        // does it match a hash that we have?
        if (await outputFile.hashValid(events, options)) {
            session.channels.debug(`Acquire '${outputFilename}': local file hash matches metdata`);
            // yes it does. let's just return done.
            return outputFile;
        }
        // invalid hash, deleting file
        session.channels.debug(`Acquire '${outputFilename}': local file hash mismatch, redownloading`);
        await outputFile.delete();
    }
    else if (await outputFile.exists()) {
        session.channels.debug(`Acquire '${outputFilename}': skipped due to existing file, no hash known`);
        session.channels.warning((0, i18n_1.i) `Assuming '${outputFilename}' is correct; supply a hash in the artifact metadata to suppress this message.`);
        return outputFile;
    }
    session.channels.debug(`Acquire '${outputFilename}': checking remote connections`);
    events.downloadStart?.(uris, outputFile.fsPath);
    let sha512 = undefined;
    if (hashAlgorithm == 'sha512') {
        sha512 = options?.value;
    }
    await (0, vcpkg_1.vcpkgDownload)(session, outputFile.fsPath, sha512, uris, events);
    events.downloadComplete?.();
    // we've downloaded the file, let's see if it matches the hash we have.
    if (hashAlgorithm == 'sha512') {
        // vcpkg took care of it already
        session.channels.debug(`Acquire '${outputFilename}': vcpkg checked SHA512`);
    }
    else if (hashAlgorithm) {
        session.channels.debug(`Acquire '${outputFilename}': checking downloaded file hash`);
        // does it match the hash that we have?
        if (!await outputFile.hashValid(events, options)) {
            await outputFile.delete();
            throw new Error((0, i18n_1.i) `Downloaded file '${outputFile.fsPath}' did not have the correct hash (${options.algorithm}: ${options.value}) `);
        }
        session.channels.debug(`Acquire '${outputFilename}': downloaded file hash matches specified hash`);
    }
    session.channels.debug(`Acquire '${outputFilename}': downloading file successful`);
    return outputFile;
}
async function resolveNugetUrl(session, pkg) {
    const [, name, version] = pkg.match(/^(.*)\/(.*)$/) ?? [];
    assert_1.strict.ok(version, (0, i18n_1.i) `package reference '${pkg}' is not a valid nuget package reference ({name}/{version})`);
    // let's resolve the redirect first, since nuget servers don't like us getting HEAD data on the targets via a redirect.
    // even if this wasn't the case, this is lower cost now rather than later.
    return session.fileSystem.parseUri(`https://www.nuget.org/api/v2/package/${name}/${version}`);
}
exports.resolveNugetUrl = resolveNugetUrl;
async function acquireNugetFile(session, pkg, outputFilename, events, options) {
    return https(session, [await resolveNugetUrl(session, pkg)], outputFilename, events, options);
}
exports.acquireNugetFile = acquireNugetFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNxdWlyZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJmcy9hY3F1aXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsbUNBQWdDO0FBQ2hDLGtDQUE0QjtBQUc1QixtREFBMkQ7QUFHM0Qsb0NBQXlDO0FBT2xDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQWdCLEVBQUUsY0FBc0IsRUFBRSxNQUErQixFQUFFLE9BQXdCO0lBQzdKLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMxQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsY0FBYyxXQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWpILDZDQUE2QztJQUM3QyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUN0QixJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDZix1QkFBdUI7WUFFdkIsSUFBSSxPQUFPLEVBQUUsU0FBUyxJQUFJLE9BQU8sRUFBRSxLQUFLLEVBQUU7Z0JBQ3hDLGtCQUFrQjtnQkFDbEIsZUFBZTtnQkFDZixJQUFJLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDRCQUE0QixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDakUsT0FBTyxHQUFHLENBQUM7aUJBQ1o7YUFDRjtpQkFBTSxJQUFJLE1BQU0sR0FBRyxDQUFD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
// SIG // Begin signature block
// SIG // MIIoOgYJKoZIhvcNAQcCoIIoKzCCKCcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7G5VgON4qV6D2XpxPnsUwJnXH+md8365zbmM3O8ubX6g
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
// SIG // ghoNMIIaCQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCByvOqbaEa33+sT
// SIG // eM/vIkfW4zUUqGquOix6rltVoWvw6DBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAGKsHTGWFnWczM2RgHfxkiI6GhvNcOgW
// SIG // N3TNy73ClJVzXFoGazAuuzR6Upg9rgZnT2PDU96Qjde3
// SIG // Hc8InS347VNF7PFC9CGffFMmmojh/zZXTpIBai6UKO9K
// SIG // bKHWSYoYS16EYYbad/WpfZ8CBz0n2xgJWoGwLN/4R8gL
// SIG // c4q0gk8Ka/0wyuIbzUG5acrz/zQiBMG7fdu42PK+MOWB
// SIG // +knoywszs0wbHSuzLG5qr/7sIv5FC28oIe1aEaJuttqm
// SIG // wvJAiXyDeaZCXvHl0IeM/jqInO/x63jYseWgEZYmo3RF
// SIG // Q2KwkWQK7h4AePnwBHJCBnmDnaJh6Eo8VGJz9y/CC1+t
// SIG // TpChgheXMIIXkwYKKwYBBAGCNwMDATGCF4Mwghd/Bgkq
// SIG // hkiG9w0BBwKgghdwMIIXbAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // cT5ASXHz+d14qlJoUMm8+6CsDXdJjttuFKCbgvYPJOEC
// SIG // BmffCaVpDhgTMjAyNTA0MDExOTU5MzkuMzUxWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjM3MDMt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR7TCCByAwggUIoAMCAQIC
// SIG // EzMAAAIKR7IU2e6ysw8AAQAAAgowDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjU3WhcNMjYwNDIyMTk0MjU3WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjM3MDMtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAsuzc8BKW+wacAJPSydNF6t9E3E43MDWfNE8QLQG4
// SIG // UmidpMJyQNQLvw6Pf3xAYwB7+jJrbd35jw3iCZ0O1QXi
// SIG // KvEXH43I62zyIN8AOb+TEH5TzUgTTr3F0T/n2ZwMtBCw
// SIG // 835yR5wpGTbEFGexhey8VC0yjmGNmCcOE65nB6IZGOg4
// SIG // wmcsYaphkMMHW46D1kW2Lv6MxXpv8nyT8o1QapddOvG3
// SIG // FYefAPHOQg+k1jfy97vjcvuzvPg73q+qgU+OBMu6Xz2T
// SIG // GdR4u8rwi7+Sxs0geqNjg+RiGcu8+JIfFGB3c45/Vsfk
// SIG // Gdtt90iUCrWYaSO7h396DE4NM2p0H8+5oLnXn5hga0BI
// SIG // NaMd5/t04s4dA/c1ZjUD/bBY7D0LTRmfSA/R/APpBSJ8
// SIG // eJq0sQNkshjDkHMZRjN9JLSCjN4qgrhRFPQh1TKTfeP9
// SIG // X5eE+j6Jyfv6FiahZWrWLjCr9mfLoqa5xXAMQqTrAyFQ
// SIG // TvStbx3gDIkEFJXBPQg+d+iNWC55jtqh2oDz5l4XThqx
// SIG // 1JwlLaKdtXpbpB4e+av+cx/jpzXpKebnaY0DWQr4mAGX
// SIG // R7C55FNDX1AK+q9VKg3Eqtcn+UYsIpgfEo7HZh5ZeID4
// SIG // 5qlYtP65pzNaABEJtz8lnE0EIm2C4rije2OIqOWyU1cJ
// SIG // vr0UW6SeVC/w99wv/+6px23qFgUCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBQCrxdBBI+AMj32PFv6q7AL37WcJDAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAsJNz1tAsozmqlwjDrrE3Xu3q
// SIG // dgsD/8VdSd6PSgIiknavGtlEeUQh2IZybHnpsHjFB9pD
// SIG // Xn6ZwIdgZ/B9qKQ87QyZI/DmEXfykMrBNdjcGmNyjsAF
// SIG // vEYPDnV7+X1GSLDloKa5AkDNFaBR3V2BMZCTdxMwW1Al
// SIG // MN8m+IABTyuek/unD6SPDCSyQkFxzTILYtkGYV/SpH0Q
// SIG // H3xWDBXKbGyPqM4guQa65N9+tXCRR4YBCUdCeNp6mUxk
// SIG // oFKQxh0mQERqjXAFeYfjkAy3hdqd1Ecfz+jHFINZydoD
// SIG // D2AbA/m8HfQdHP1yGfTLd7o5RCz6ZIo4wnUmcYc7tjN0
// SIG // mVia+e7mPhQvi7KbyDh9TqaH2p4dyRg6LDXABLvclDFi
// SIG // rBATJ4A+lVkEkGGel/RfNMwqHmcE6tIvQLo52M88eVtn
// SIG // xIGXo0buitRggEps7TZWCZQAo6mn1kaH06pCYVfydr/e
// SIG // 1967g736bjrkKFLVQMF6w7BtjTgbr1bKOSnVueIQUrM/
// SIG // +PjkQeKi56uPxjbWo1B6KykShxjoBaPAymlxvlDQDcIR
// SIG // jcR2yC0mufT8RMTIAowUT9/NvMhirKrkhM8yzVp8+Wn/
// SIG // WZnh+PNPX8CLbSONSZLomPV+oZjJi2L/DmN+L7zivs8s
// SIG // ZEvvQVC1QD+oLfsmh2gZa5Z/BouP3Qa9sukq6/+eoNAw
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
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDUDCC
// SIG // AjgCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjozNzAzLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUA0QDFSZQOmyqvd1Z7t1JCYJuR5WGggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWtlMwIhgPMjAyNTA0MDExOTAw
// SIG // MzVaGA8yMDI1MDQwMjE5MDAzNVowdzA9BgorBgEEAYRZ
// SIG // CgQBMS8wLTAKAgUA65a2UwIBADAKAgEAAgIoKwIB/zAH
// SIG // AgEAAgISnDAKAgUA65gH0wIBADA2BgorBgEEAYRZCgQC
// SIG // MSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQow
// SIG // CAIBAAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQA2E8u6
// SIG // iLJ2nFuWtZLkXfI2/KVK3OA0neFGXMfhPI8O9r+RPa0d
// SIG // t0vLdnoyVFaRt0qCKTC8G6QxQB1lY2R6GvDPamcsz2kd
// SIG // xA655D3DM4Bzss45qiQS+g89SPjYl1YWpl4Jx6FhO8aS
// SIG // Np7Bsi3ycjzhPrA0TPU/6tsYv1uavTOSpwEEegUyGlIu
// SIG // lgP6zk36Jq/O6DQsZTx0GQfb7S3WSueifB6iI8z819uw
// SIG // V223PxJNpS7diOIONLnpjBokhS8Ou/BVOi2q0GhWtPr9
// SIG // hxH11MvRwsQQwP10jW//aNpieK0QLX2An3s0Ox4kkIVT
// SIG // 4nHC21VeInGxxg55mOUkSjcG5FaAMYIEDTCCBAkCAQEw
// SIG // gZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAIKR7IU2e6ysw8AAQAAAgowDQYJYIZIAWUDBAIBBQCg
// SIG // ggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAv
// SIG // BgkqhkiG9w0BCQQxIgQgcihRx72JsEfU1gf4bNthKZ18
// SIG // ndHfMaLx9ufuQrF6x+MwgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCBNmsv8tHqSv192dNyk3JaKhPLvSF0b
// SIG // XTuzHsdIcPfkmjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAACCkeyFNnusrMPAAEAAAIK
// SIG // MCIEICnIIkPyurIi3ZkC4tyl9SocYNexETFym6HDAIs1
// SIG // a6Z4MA0GCSqGSIb3DQEBCwUABIICAHpxVVEbq8A1fIZv
// SIG // jQt0XQN+vOUgkxNOXozt4BMxB6GgqbwETxGDUMgcxGd5
// SIG // vsokM/24yUaO5rMAV7yuPYkE0gw5WUqi6eQiDIeoKVJS
// SIG // 2JAPFU7iWHsQ0rb8DS4Fj3ZwY66xujSAcpheHMFKXLgn
// SIG // TWEZPUIrSzNK+u87iiZc+2R2fRE1XEWBjbaag5PCMpzy
// SIG // FQke44qmw9NfibZSjPXgW0ZvGb6+Qzt9WqAz2MrcOb6C
// SIG // jlfJHE2S2k3nnPLNPICwaWx5LzzVj0N7BBacPX+OmjFh
// SIG // 5V3akaBbu0Kk8Zu0Fmg39mdFe0MDOEz5jCrajAI5VVfK
// SIG // gzLanQuCZ9WVAUfZ08hkfj5c/U7TF0KLE04pQFDWs8ro
// SIG // Yo0UFWZVedI/rqF68EkoPMAmDevk+EmD3azBMPq7btGq
// SIG // xKWW0FouGAEF77pi2HfcnDuwT1W+Qwls98jOqA4ZbPZw
// SIG // Xem+ZWt+r12lEJDEf0yrjaYd84DniZvX9kcfACXXhihm
// SIG // iDVMlUeHDVFFzZmbclFcuWqU4KFzPKGvFxmKSpWHqx8a
// SIG // on8rEY7p7XeEKL5tgpFo6iTVdT7Lfyq5zTVc4FhEWCyK
// SIG // AnuaaXDx2LMLac8D5vQ3rMuy83cD+47IpWoDR/4CrWZF
// SIG // 7eMxTgOw+9zb/z1+KOhy+cQqWBXw47Diber5qokpnEXP
// SIG // UOdJeHF8
// SIG // End signature block
