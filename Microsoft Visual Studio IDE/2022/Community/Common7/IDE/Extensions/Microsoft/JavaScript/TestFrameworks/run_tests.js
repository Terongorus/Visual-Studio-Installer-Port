//@ts-check
var framework;
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async function (line) {
    rl.close();

    RunTestsOnFrameworks(line);
});

function createContext(line) {
    function setFullTitle(testCases) {
        // FullyQualifiedName looks like `<filepath>::<suite><subSuite>::<testName>`.
        // <suite> will be `global` for all tests on the "global" scope.
        // The result would be something like `<suite> <subSuite> <testName>`. Removes `global` as well.
        const cleanRegex = /.*?::(global::)?/;

        for (let testCase of testCases) {
            testCase.fullTitle = testCase.fullyQualifiedName.replace(cleanRegex, "").replace("::", " ");
        }
    }

    function getFullyQualifiedName(testCases, fullTitle) {
        // TODO: Don't do linear search, instead use a property or cache the fullTitle, fullyQualifiedName.
        for (let testCase of testCases) {
            if (testCase.fullTitle === fullTitle) {
                return testCase.fullyQualifiedName;
            }
        }
    }

    function post(event) {
        if (event) {
            if (event.result) {
                // Some test frameworks report the result on the stdout/stderr so the event will be empty. Set only stdout and stderr if that's the case.
                event.result.stdout = event.result.stdout || newOutputs.stdout;
                event.result.stderr = event.result.stderr || newOutputs.stderr;
            }

            // We need to unhook the outputs as we want to post the event to the test explorer.
            // Then hook again to continue capturing the stdout
            unhookOutputs();
            console.log(JSON.stringify(event));
            hookOutputs();
        }
    }

    function clearOutputs() {
        newOutputs = {
            stdout: '',
            stderr: ''
        };
    }

    let testCases = JSON.parse(line);
    setFullTitle(testCases);

    return {
        testCases: testCases,
        getFullyQualifiedName: (fullTitle) => getFullyQualifiedName(testCases, fullTitle),
        post,
        clearOutputs
    };
}

function hookOutputs() {
    oldOutputs = {
        stdout: process.stdout.write,
        stderr: process.stderr.write
    };

    process.stdout.write = (str, encoding, callback) => {
        newOutputs.stdout += str;
        return true;
    };
    process.stderr.write = (str, encoding, callback) => {
        newOutputs.stderr += str;
        return true;
    };
}

function unhookOutputs() {
    process.stdout.write = oldOutputs.stdout;
    process.stderr.write = oldOutputs.stderr;
}

async function RunTestsOnFrameworks(line) {
    // strip the BOM in case of UTF-8
    if (line.charCodeAt(0) === 0xFEFF) {
        line = line.slice(1);
    }

    const context = createContext(line);

    // get rid of leftover quotations from C# (necessary?)
    for (var test in context.testCases) {
        for (var value in context.testCases[test]) {
            context.testCases[test][value] = context.testCases[test][value] && context.testCases[test][value].replace(/["]+/g, '');
        }
    }

    try {
        framework = require('./' + context.testCases[0].framework + '/' + context.testCases[0].framework + '.js');
        await framework.run_tests(context);
    } catch (exception) {
        console.log("TESTADAPTER_ERROR:Failed to load TestFramework (" + context.testCases[0].framework + "), " + exception);
        process.exit(1);
    }
}

let oldOutputs = {};
let newOutputs = {
    stdout: '',
    stderr: ''
};

module.exports.RunTests = RunTestsOnFrameworks;

hookOutputs();
// SIG // Begin signature block
// SIG // MIIoTwYJKoZIhvcNAQcCoIIoQDCCKDwCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // cgHzHmQMyd/6r4znxFuSBn58aTMNJdFvRdeRysIl/Dyg
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
// SIG // ghoiMIIaHgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBjIL9b0jaEn5OJ
// SIG // uEcBKhmmXowIoKaaipuFohJFTlMptjBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBADHmgXocFkOT+a4M/oKoOZbpu+yeLPbA
// SIG // x2a3nf/3XL5DBElhpExoFTCKSRMse6H7NG40EYUIVXAC
// SIG // 2n7cd2//doq5VaqV/VpxcFpuhYDLTTMF68isuW1kiUgW
// SIG // T8eVs76dtzknBJikO/s/+j2sr7olkp47SZS/H6vMGaGM
// SIG // /MtlVZxNV9AoIiSHwhKjMCm8OXATh8MhoCHFhMZ5waDH
// SIG // qGfuJ69/hYE1Bo1/SZ1s53fcUkNhGUFnjBo68YKreQOK
// SIG // LTsZ/UPVH8o6YCR8bExmPPG2t4Lou+JPfWgc6bOAhpBU
// SIG // hM48OV5s2wQnP7oj6+vlAqDrgpmA6dyCt61PSX624uRB
// SIG // S5+hghesMIIXqAYKKwYBBAGCNwMDATGCF5gwgheUBgkq
// SIG // hkiG9w0BBwKggheFMIIXgQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWQYLKoZIhvcNAQkQAQSgggFIBIIBRDCCAUAC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // ajEeoTQWH4Rkm7KgJKusP7ND/KuaLjzhGcurX9hpH7wC
// SIG // Bme2HdltGBgSMjAyNTA0MDEwOTE1NDMuMTdaMASAAgH0
// SIG // oIHZpIHWMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // Tjo0MzFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEfswggcoMIIF
// SIG // EKADAgECAhMzAAAB+vs7RNN3M8bTAAEAAAH6MA0GCSqG
// SIG // SIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMB4XDTI0MDcyNTE4MzExMVoXDTI1MTAyMjE4MzEx
// SIG // MVowgdMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjQz
// SIG // MUEtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAg8AMIICCgKCAgEAyhZVBM3PZcBfEpAf7fII
// SIG // hygwYVVP64USeZbSlRR3pvJebva0LQCDW45yOrtpwIpG
// SIG // yDGX+EbCbHhS5Td4J0Ylc83ztLEbbQD7M6kqR0Xj+n82
// SIG // cGse/QnMH0WRZLnwggJdenpQ6UciM4nMYZvdQjybA4qe
// SIG // jOe9Y073JlXv3VIbdkQH2JGyT8oB/LsvPL/kAnJ45oQI
// SIG // p7Sx57RPQ/0O6qayJ2SJrwcjA8auMdAnZKOixFlzoooh
// SIG // 7SyycI7BENHTpkVKrRV5YelRvWNTg1pH4EC2KO2bxsBN
// SIG // 23btMeTvZFieGIr+D8mf1lQQs0Ht/tMOVdah14t7Yk+x
// SIG // l5P4Tw3xfAGgHsvsa6ugrxwmKTTX1kqXH5XCdw3TVeKC
// SIG // ax6JV+ygM5i1NroJKwBCW11Pwi0z/ki90ZeO6XfEE9mC
// SIG // nJm76Qcxi3tnW/Y/3ZumKQ6X/iVIJo7Lk0Z/pATRwAIN
// SIG // qwdvzpdtX2hOJib4GR8is2bpKks04GurfweWPn9z6jY7
// SIG // GBC+js8pSwGewrffwgAbNKm82ZDFvqBGQQVJwIHSXpjk
// SIG // S+G39eyYOG2rcILBIDlzUzMFFJbNh5tDv3GeJ3EKvC4v
// SIG // NSAxtGfaG/mQhK43YjevsB72LouU78rxtNhuMXSzaHq5
// SIG // fFiG3zcsYHaa4+w+YmMrhTEzD4SAish35BjoXP1P1Ct4
// SIG // Va0CAwEAAaOCAUkwggFFMB0GA1UdDgQWBBRjjHKbL5WV
// SIG // 6kd06KocQHphK9U/vzAfBgNVHSMEGDAWgBSfpxVdAF5i
// SIG // XYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5o
// SIG // dHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2Ny
// SIG // bC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIw
// SIG // MjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsG
// SIG // AQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20v
// SIG // cGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3Rh
// SIG // bXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8E
// SIG // AjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4GA1Ud
// SIG // DwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEAuFbC
// SIG // orFrvodG+ZNJH3Y+Nz5QpUytQVObOyYFrgcGrxq6MUa4
// SIG // yLmxN4xWdL1kygaW5BOZ3xBlPY7Vpuf5b5eaXP7qRq61
// SIG // xeOrX3f64kGiSWoRi9EJawJWCzJfUQRThDL4zxI2pYc1
// SIG // wnPp7Q695bHqwZ02eaOBudh/IfEkGe0Ofj6IS3oyZsJP
// SIG // 1yatcm4kBqIH6db1+weM4q46NhAfAf070zF6F+IpUHyh
// SIG // tMbQg5+QHfOuyBzrt67CiMJSKcJ3nMVyfNlnv6yvttYz
// SIG // LK3wS+0QwJUibLYJMI6FGcSuRxKlq6RjOhK9L3QOjh0V
// SIG // CM11rHM11ZmN0euJbbBCVfQEufOLNkG88MFCUNE10SSb
// SIG // M/Og/CbTko0M5wbVvQJ6CqLKjtHSoeoAGPeeX24f5cPY
// SIG // yTcKlbM6LoUdO2P5JSdI5s1JF/On6LiUT50adpRstZaj
// SIG // bYEeX/N7RvSbkn0djD3BvT2Of3Wf9gIeaQIHbv1J2O/P
// SIG // 5QOPQiVo8+0AKm6M0TKOduihhKxAt/6Yyk17Fv3RIdjT
// SIG // 6wiL2qRIEsgOJp3fILw4mQRPu3spRfakSoQe5N0e4HWF
// SIG // f8WW2ZL0+c83Qzh3VtEPI6Y2e2BO/eWhTYbIbHpqYDfA
// SIG // tAYtaYIde87ZymXG3MO2wUjhL9HvSQzjoquq+OoUmvfB
// SIG // UcB2e5L6QCHO6qTO7WowggdxMIIFWaADAgECAhMzAAAA
// SIG // FcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGI
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkg
// SIG // MjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMy
// SIG // MjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGm
// SIG // TOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YB
// SIG // f2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMM
// SIG // tY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTI
// SIG // cVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+
// SIG // NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130/o5T
// SIG // z9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi9
// SIG // 47SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uD
// SIG // RedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tn
// SIG // YN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/Nme
// SIG // Rd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03
// SIG // dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5
// SIG // TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy
// SIG // 16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkL
// SIG // iWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXps
// SIG // xREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqP
// SIG // nhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsG
// SIG // AQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqn
// SIG // Uv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsG
// SIG // AQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVw
// SIG // b3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEs
// SIG // H2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfC
// SIG // cTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2Y
// SIG // urYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/
// SIG // SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRW
// SIG // qveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wX
// SIG // sFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixr
// SIG // e24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoy
// SIG // GtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8
// SIG // x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk
// SIG // 2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pF
// SIG // EUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq7
// SIG // 7EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGC
// SIG // onsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1Zyvg
// SIG // DbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7
// SIG // vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0
// SIG // HVUzWLOhcGbyoYIDVjCCAj4CAQEwggEBoYHZpIHWMIHT
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // JzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo0MzFBLTA1
// SIG // RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUA94Z+
// SIG // bUJn+nKwBvII6sg0Ny7aPDaggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsF
// SIG // AAIFAOuV/dYwIhgPMjAyNTA0MDEwNTUzMjZaGA8yMDI1
// SIG // MDQwMjA1NTMyNlowdDA6BgorBgEEAYRZCgQBMSwwKjAK
// SIG // AgUA65X91gIBADAHAgEAAgImUDAHAgEAAgITiTAKAgUA
// SIG // 65dPVgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEE
// SIG // AYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0G
// SIG // CSqGSIb3DQEBCwUAA4IBAQCxXos3CStOIIc1daOSKhNd
// SIG // ai5xxBU2vu/2SHqasf5rJqzCot6Msav9fe/lp1YsYzML
// SIG // WR2Jbe4wbm1tTDgNkFYyHiNcdebu3VR5x1UGW40bt7aC
// SIG // lO1ZQ7UrsrqsIhgxm+VLy4mu5jJ0/SoPIVP0QL0Z29j5
// SIG // i2CVAhAjFF3dgn0lqNZTNho5dA4FQVocfq6PfYQAXi/2
// SIG // uD/fDoT7+1JxLsZDMUycHoWhGOTkVjFjSYbkhuXbRo0v
// SIG // 5iDuPPSoWz1FJv0LOyUiozT8HbGTpegpjpi8cOVkX760
// SIG // 6F/uS9NgxIoGHZVj1ik2qQqG1X6q5RcfRtzjlGbqbCdG
// SIG // spcOhnlYt6qLMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAH6+ztE03czxtMA
// SIG // AQAAAfowDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgtXxD5VmbgFG4cE4wHJddpt/7Hz4e9Vx/YXSsEOoE
// SIG // vP4wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCB9
// SIG // 8n8tya8+B2jjU/dpJRIwHwHHpco5ogNStYocbkOeVjCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAAB+vs7RNN3M8bTAAEAAAH6MCIEICrQHD+E6vzZ
// SIG // q4/skd7dxV9FilgHB22lrQbQwRh2Llw4MA0GCSqGSIb3
// SIG // DQEBCwUABIICAJkTCpRhMZX2yePNaJxjZmfZFFjEAkUP
// SIG // 523JHn0chEAswcsymMCg4X25F1piWyKPVCcuc4l4eVXr
// SIG // Y3JCUdTEz2QVhPlWtNRSH3rUeDNck+tLxUILBKBzQEAV
// SIG // ocqe8NMOIzs3FgmhdvaErwJTCIE2XWMA+KjMojeBFQF4
// SIG // Qzb1zlNEMoYO42+BNnuSirr4g3FfGuOIQ7XB8Oyo9xrX
// SIG // 0coTJPLnsQKzryCpqr6ztbOYwVfrPYoUIXQYwv/anQ4W
// SIG // seau1tpXoLXu7FXxmUWaNqRg85VSQCbeGZdzjMLsubPx
// SIG // qqAKqPjqpH52f9SXJ971psZgwz/yJeFdppX8VdL59JSf
// SIG // vC9WSFn62/Hbd/4tI6pnJboEwQTOAs2FKws4C1jP2Dgk
// SIG // XqV8iv+ZUBuNTBx971p8JK19qjvEs7jKGJzlFP6Nh0m8
// SIG // udXpNnKqkeE/EUERsF7n80BnbnN/NDGVIzGELEHUu2Un
// SIG // QVqOziX9767DmooxcQYq03M4zgVHfOC0STk/TA5uF72x
// SIG // wES0g9rneOMPJ9gZ3J9+b93mdMKBaY2w29MqraPFvXC2
// SIG // nesN579UpfDbeQenJhxM1vKhbBg4JMcquApujYzZmTVv
// SIG // DeRZMMO+DTY6fYc0Ah6LDqXp+cFXuetCIzfa0Y7LoGwk
// SIG // fHqLv6IpX35Sj6p+mORwiooWPlvuZcaL95iE
// SIG // End signature block
