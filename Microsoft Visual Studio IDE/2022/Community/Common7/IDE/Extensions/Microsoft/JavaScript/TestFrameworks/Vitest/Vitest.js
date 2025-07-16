const path = require('path');
const { logError, writeDiscoverFile } = require('../utils.js');
const EOL = require('os').EOL;
const { createRequire } = require('module');
const url = require('url');

async function find_tests(testFileList, discoverResultFile, projectFolder) {
    const vitest = await findVitest(projectFolder);
    const testList = [];

    try {

        const vitestInstance = await vitest?.createVitest('test', {
            watch: false,
            root: projectFolder,
            includeTaskLocation: true
        },
        {
            server: { // Vitest has internal components that do not allow fs to access folders outside the project root. This assures that both project root and this folder are allowed.
                fs: {
                    allow: [projectFolder, __dirname]
                },
            }
        });

        if (vitestInstance === null) {
            logError('Failed to create Vitest instance.');
            return;
        }

        vitestInstance.config.runner = path.join(__dirname, 'VitestRunner.ts');

        await vitestInstance.start();

        for (const file of vitestInstance.state.getFiles()) {
            for (const suite of file.tasks) {
                for (const test of suite.tasks) {
                    testList.push({
                        name: test.name,
                        suite: suite.name,
                        filepath: file.filepath,
                        line: test.location.line,
                        column: test.location.column
                    });
                }
            }
        }

        await writeDiscoverFile(discoverResultFile, testList);

        await vitestInstance.close();

    } catch (e) {
        logError(`Failed to find tests. ${e}`);
    }
}
module.exports.find_tests = find_tests;

async function run_tests(context) {
    const projectFolder = context.testCases[0].projectFolder; 

    // First, find Vitest on the project folder
    const vitest = await findVitest(projectFolder);

    // Then get the Reporter we have custom made for Visual Studio.
    const reporterPath = path.join(__dirname, 'VitestReporter.js');
    const reporterURL = url.pathToFileURL(reporterPath).href;

    // Then start tests and report to Visual Studio.
    for (const testCase of context.testCases) {
        context.post({
            type: 'test start',
            fullyQualifiedName: testCase.fullyQualifiedName
        });
    }

    // Using dynamic import to load the reporter module, this apparently messes with the "default" resolution, so I'm manually destructuring the module.
    const VitestReporter = (await import(reporterURL)).VitestReporter;

    try {

        const vitestInstance = await vitest?.createVitest('test', {
            watch: false,
            root: projectFolder,
            reporters: [new VitestReporter(context)],
            include: [context.testCases[0].testFile.replace(/\\/g, '/')],
            includeTaskLocation: true
        });

        if (vitestInstance === null) {
            logError('Failed to create Vitest instance.');
            return;
        }

        await vitestInstance.start();
        await vitestInstance.close();

    } catch (e) {
        logError(`Failed to find tests. ${e}`);
    }
}
module.exports.run_tests = run_tests;

async function findVitest(projectFolder) {
    try {
        // Using createRequire with a mock file to resolve the Vitest package path on the project folder. 
        const vitestPath = createRequire(path.resolve(projectFolder, 'noop.js')).resolve('vitest/node');
        const vitestURL = url.pathToFileURL(vitestPath).href;
        const vitestModule = await import(vitestURL);

        return vitestModule;
    } catch (e) {
        logError(
            'Failed to find Vitest package. Vitest must be installed in the project locally.' + EOL +
            'Install Vitest locally using the npm manager via solution explorer' + EOL +
            'or with ".npm install vitest --save-dev" via the Node.js interactive window.');
        return null;
    }
}
// SIG // Begin signature block
// SIG // MIIoUwYJKoZIhvcNAQcCoIIoRDCCKEACAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // gQtX6K74Op69DwZmS/XpbQ1rKH93oM5C+HiMYB+TUYGg
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
// SIG // ghomMIIaIgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC4w57rCDygL659
// SIG // ioNKDd296i86EMeQ0Nuu/jcIyJfWqTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAJ7J66TO/Vpt1MAhzgTQvadSlM4lyUah
// SIG // mnqH3SOMfUbaEERpZIBRJmW2EEPx0TCyA42JQOojgL/Y
// SIG // /uEL+P4lMq4yZgGMI+S6+6Vn2s9SaTpQorYW3x3jX+Fl
// SIG // thiKCDOTTJNsBfxDOWBBGJr4fFzqpIeJMfmemZnx8pcT
// SIG // 2yzMCHgFOjvVXYYUve9Z4ycA26jVh5f+NkfOmMofGa1X
// SIG // 80KRv3EE9GRF4jfBYIkdjR7AMH6JgVykbfc9ILJC7cYl
// SIG // c36YDpeET23dnDD6lnz6XbRHXWYMP1UU8dgcIh+Ik3Bg
// SIG // VoETfJ8/m73Pisw4pZ/st22mnGZfs2dbFHMcuuOTGSF2
// SIG // oXyhghewMIIXrAYKKwYBBAGCNwMDATGCF5wwgheYBgkq
// SIG // hkiG9w0BBwKggheJMIIXhQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // feo2BtAlhmFxlsd+MHSV9nQMDtHkq34xIdNAlXSVpiQC
// SIG // Bme2M4dUgxgTMjAyNTA0MDEwOTE1NDAuNzU0WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NkIwNS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH+MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfaDLyZqVF0iwQABAAAB9jANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMDRaFw0yNTEwMjIxODMx
// SIG // MDRaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo2
// SIG // QjA1LTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBANFCXizEfzfVjwWYbilR
// SIG // RfnliWevFro3Y+F+iUdOXMTuQnqTV6Ne61Ws8Fi5JuQI
// SIG // 2lYdfWVYwwoR84psbKGl8TbvCA4ICsKV76QACLb+FMed
// SIG // HvUtrlcHyr+e6fSShvkO1TjUobo5dTQjJHIEqz3Znf/M
// SIG // 3LJoc3DaGy6JqwgCDkWfCMIWMuLIlUJX9TSoZcgM5pFi
// SIG // Q9DfutCIqIBQc4N8iErL66DsdMdcUotj4kSEJU1xO+DI
// SIG // IGQyAyqh/4W/RU9pCv51f2l47qPSzK60Zp+OKGGAA3v6
// SIG // zveRfkht7rroX/h+CK4l69IfabQOksByT0tlZmzVgo0F
// SIG // quRuGJK3KmzzGse7zV1MLu0+uRPHxT3dSLhPUbBuEzAF
// SIG // e15FwaKZjzX7y9IY8YOOJKUJ9/OFeOqPs3UKsuSvXQ5V
// SIG // pvyer2baecgNT8g98Ph2xrm0tJ4hENS+sBjqz38yJtBX
// SIG // Tp/sRaOPBEZfhccP9zr1zOQmNRKp8xM5z48yXOzicISV
// SIG // Ud1UAx4wXBBUzr0vRNHYjbtXqHMPmQpM+D7v6EL/oKlP
// SIG // m38S/HuzxZLX0Q5TOhcjs4z+M7iNuYA/LTvcyYOoOn0a
// SIG // WmXON/ZgG5Jd8wlc0yw4HIb+ksUGoybb76EGmcUH9LUY
// SIG // j3G69h1nzKKqnfbokNIU1BIRuOBQUk3lD2XhHp0QlmnQ
// SIG // luBvAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUSMGbCbjn
// SIG // CX0nD1nF2bgQOAfPSvIwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBANd5
// SIG // AYqx9XB7tVmEdcrI9duaJhrUND2kJBM8Bm+9MbakqCPr
// SIG // L0IobIHU2MWj36diFRXYI2jGgYvNcAfP57vOuhXxSinY
// SIG // Xad8JzGfdT6T+DqHuzXH+qiApIErsIHSHUL6hNIfFUOU
// SIG // FubA1eENCZ4+H+yh2MeDYjPAuI08PEkLbLsVokx9h4pH
// SIG // 90GAe9Wu3Qfc4BzpFtIYFBHljvZodsFqmEv0OPAEozqm
// SIG // MP4WueKFTn39tlmqB/vx8XfTUxFP+L5b7ESDFk9I7JzS
// SIG // O9Y1QK0+EPQbelUoVs8qq2hOkilKGaxMAaVbCNCzINl9
// SIG // 4Ti25Qtb8TN/sDMjofe2hTrO7BZ7nprSNjH4/KoNegWU
// SIG // ycV5aT7q1qxvjgY+AaEw5AvQMV2Ad8hLbsDLO6UVi8sS
// SIG // McP8FfUxylBpvsflRNDzi8JK0jII7pUl5KXxCx1loglb
// SIG // JSWxSCAf+AJb/o0CUigCbqPQhK25tqng5P84yWJWGlRj
// SIG // MirmGfrkkVSgdqpBD3BMxtXTvcyGtTKd9ifs81tz+7Li
// SIG // X48OtrN4Qzi5PupTEDkdOMftqNexty3Hi5JMSZuNRK3Y
// SIG // k4wJnQpXp/cpeh4DKRkuKJIxQiV/gqThV+4AQNz1cUFr
// SIG // m4rAEGy+R4ExQbUDRM3AnYdRmMP+p88zTbftBkJ56GwX
// SIG // XXzgIqpM7yLal47xsitUMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCA1kwggJBAgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NkIwNS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVABVP
// SIG // XkqXcbNGtOiRSLhhRyI/yPt+oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlhOJMCIYDzIwMjUwNDAxMDcyNjAxWhgPMjAy
// SIG // NTA0MDIwNzI2MDFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOuWE4kCAQAwCgIBAAICD+cCAf8wBwIBAAICEjow
// SIG // CgIFAOuXZQkCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQsFAAOCAQEA3lfDnsfhZPyA1nRe
// SIG // WZ+HDutaNU6IxxtX0rFsPnRF7CT0jKpVzEKjw7ZfVlZp
// SIG // b+eNoIkMG/zARzkRrEV1twtZ8bqx9Yppp5oO3iKZKoD3
// SIG // HVprJiQXtJYE+Q2YF/rsQni1TwA4kB2QI9VgvEW8BfQx
// SIG // +egzZfpVAHj/T+6uuzOlkh6iN8t37oUvD0nu/1NOzTrh
// SIG // gbLazrcXVJLneJVu1lStwuLmttCyn2RHEA9VgUyxgP1a
// SIG // VgHzZHQ4/UQv1fz807Z4S/Cu0l5tUFheCb5SjZSiQMfq
// SIG // 8zo0Rba06CnYvCwWZeGlBSxKK4oUs+DoEeQyHMJUc7p8
// SIG // QPZvt97eI3qu/2vPmjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB9oMvJmpU
// SIG // XSLBAAEAAAH2MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEIKWCMf/XTK88mBKrhP4RimbxPZ8u0dTLZ623
// SIG // kSsAgk/6MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgK2FM8ZRepuVEi0uH/DVy//GqDRFXbAmUZhfi5UIx
// SIG // tqIwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAfaDLyZqVF0iwQABAAAB9jAiBCCuk3/M
// SIG // YxTEAE2nSONof8peKL/htNGm2ET4B1ZXhIjTyzANBgkq
// SIG // hkiG9w0BAQsFAASCAgAnnFNy9OTMUwaaOFFHorgkkWvI
// SIG // MZkWDuTKbeg+sL3FoV+yrBkFrHNFDTlTbi4LGuu4eghe
// SIG // quMv9zMakF8FUTXk4jsz61UF0W0msZXuJAvzS4ugYjt5
// SIG // mk4BNTvHxvrAx8sr0nsISN1BLdRdnhQs8mRnrW/OTVbc
// SIG // HQS9BLnasjuReyJ0Rj9qyNqtjASOLJlU4CdSR0iytKwt
// SIG // +m+pq+wb7PGvOJpqJNWgvMe+3mEbuHYkaxtlu8p/m672
// SIG // WywfUhmdXBNG9hJnm1US2saLJMlMaXws40q7P8WAjnDP
// SIG // FYCWMe3Vk74FTKtO4XUHekwIFWcrlYMOKSl59SmRiv09
// SIG // +s1hqbt/JZIfHO5awLVLYqPKnserl1bdZ0E1htk28146
// SIG // p56+qmaOungpmBqGjKXqA8yHdz8OeJT4Dg+I5KmN8HJY
// SIG // 8dV7YUzto6jJieUx+pNsOzX7haZIi8SutLqqpvYERoMk
// SIG // 62s2EkP6meFwAqhsr34Zjy0ZGkFVqp+LBLIZ8DmKE9xX
// SIG // iHOuCsQWwC6N/wtL88yXueHJDHdesxMPqJL4s575scCF
// SIG // Bov8tjDJG5gvCH6nCcG1YcRckEzf9WcpBYKfEo7AHaq4
// SIG // gCik/pq7b27klpFoEEfQwG6vLCa8cTq60Oi8LR/42OHZ
// SIG // OdR5qBEUJxMikjDuf6hHUFUQEZMhYFqu6YhZgBANFg==
// SIG // End signature block
