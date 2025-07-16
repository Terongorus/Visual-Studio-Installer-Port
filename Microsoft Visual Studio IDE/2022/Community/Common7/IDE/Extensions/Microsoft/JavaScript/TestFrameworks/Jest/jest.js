﻿// @ts-check
"use strict";
const fs = require('fs');
const os = require('os');
const path = require('path');

const find_tests = function (testFileList, discoverResultFile, projectFolder) {
    return new Promise(resolve => {
        const jest = detectPackage(projectFolder, 'jest');
        const jestEditorSupport = detectPackage(projectFolder, 'jest-editor-support');

        if (!jest || !jestEditorSupport) {
            return resolve();
        }

        let testList = [];
        for (let testFile of testFileList.split(';')) {
            process.chdir(path.dirname(testFile));

            try {
                const parseResult = jestEditorSupport.parse(testFile);

                visitNodes(parseResult.root.children, [], testList);
            }
            catch (e) {
                // We would like continue discover other files, so swallow, log and continue;
                console.error("Test discovery error:", e, "in", testFile);
            }
        }

        const fd = fs.openSync(discoverResultFile, 'w');
        fs.writeSync(fd, JSON.stringify(testList));
        fs.closeSync(fd);

        resolve();
    });
};

const run_tests = function (context) {
    const projectFolder = context.testCases[0].projectFolder;

    // NODE_ENV sets the environment context for Node, it can be development, production or test and it needs to be set up for jest to work.
    // If no value was assigned, assign test.
    process.env.NODE_ENV =  process.env.NODE_ENV || 'test';

    return new Promise(async resolve => {
        const jest = detectPackage(projectFolder, 'jest');
        if (!jest) {
            return resolve();
        }

        // Start all test cases, as jest is unable to filter out independently
        for (const testCase of context.testCases) {
            context.post({
                type: 'test start',
                fullyQualifiedName: testCase.fullyQualifiedName
            });
        }
        
        let config = readConfigs(projectFolder, context);
        
        const argv = {
            json: true,
            reporters: [[__dirname + '/jestReporter.js', { context }]],
            config : JSON.stringify(config)
        }

        try {
            await jest.runCLI(argv, [projectFolder]);
        } catch (error) {
            logError(error);
        }

        resolve();
    });
};

function visitNodes(nodes, suites, tests) {
    if (!nodes || nodes.length === 0) {
        return;
    }

    for (let node of nodes) {
        switch (node.type) {
            case "describe":
                const parent = suites.length > 0 ? `${suites[suites.length - 1]} ` : '';
                suites.push(`${parent}${node.name}`);

                visitNodes(node.children, suites, tests);

                suites.pop();
                break;
            case "it":
                tests.push({
                    column: node.start.column,
                    filepath: node.file,
                    line: node.start.line,
                    suite: suites.length === 0 ? null : suites[suites.length - 1],
                    name: node.name
                });
                break;
        }
    }
}

function detectPackage(projectFolder, packageName) {
    try {
        const packagePath = path.join(projectFolder, 'node_modules', packageName);
        const pkg = require(packagePath);

        return pkg;
    } catch (ex) {
        logError(
            `Failed to find "${packageName}" package. "${packageName}" must be installed in the project locally.` + os.EOL +
            `Install "${packageName}" locally using the npm manager via solution explorer` + os.EOL +
            `or with ".npm install ${packageName} --save-dev" via the Node.js interactive window.`);
        return null;
    }
}

function readConfigs(projectFolder, context)
{
    var config;
    const packageJsonPath = path.join(projectFolder, 'package.json');
    const jestConfigPathJS = path.join(projectFolder, 'jest.config.js');

    // If this is a React project, then the path exists, and we should use the react scripts config generation. 
    // It already deals with override from package.json config, if there's any.
    const pathToReactConfig = path.join(projectFolder, 'node_modules/react-scripts/scripts/utils/createJestConfig.js');
    if(fs.existsSync(pathToReactConfig))
    {
        const createJestConfig = require(pathToReactConfig);
        config = createJestConfig(
            relativePath => path.join(projectFolder, 'node_modules/react-scripts/', relativePath),
            projectFolder,
            false
        );

        return config;
    }

    // Else, for other frameworks, first prioritize package.json config if jest config exists there under "jest".
    // If not, try to find jest.config.js. If no file found, finally use a basic config.
    if(fs.existsSync(packageJsonPath))
    {
        config = require(packageJsonPath).jest;
    }

    if(!config && fs.existsSync(jestConfigPathJS))
    {
        config = require(jestConfigPathJS);
    }

    config = config || {};
    config.testMatch = config.testMatch || [context.testCases[0].testFile];    
    
    return config;
}

function logError() {
    var errorArgs = Array.from(arguments);
    errorArgs.unshift("NTVS_ERROR:");
    console.error.apply(console, errorArgs);
}

module.exports.find_tests = find_tests;
module.exports.run_tests = run_tests;
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // c0E3ox088myXiyOZKbBQcLrV81eYFO4V35ZoGQF9LNOg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCD824snmgFTMSb1
// SIG // tSnCFs19QizsNzwO+J3eY13xGdPzSzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAHp5EAQgIkdBLYGuy9aclk93vWfegUL3
// SIG // 0iQk+2h4nuf9YQ2TJQtUARN/SMJI8WM2h57xgNdygPVy
// SIG // 4az0J/xzJwra79cabRGp2lA2KheJ+KfuaRqw1moTL77Q
// SIG // 6LXOMtIK1oXX4OdzZ3q9CtLgiCUeRdF4bRcDvxYLfIb7
// SIG // cS2eal0a3Lo15hetaw/rblBcTxn7MwKjdDqm4YXi23Hn
// SIG // 6tO/mNi3ADLQY9vgunDttWmpZN9qodtZfFAYJzJReUBj
// SIG // GfLZo9Hb2mv9lmRTpak4MeEKoV0iA+j6O0Sny4h8mlEJ
// SIG // eVwCyObNq/A+Q0TIieP02f0S1c5aCGDOfbALKQvH1zD6
// SIG // NNehgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // bm9+MpjNS5j2FhUCZwEpOBroWWujOFsuXG/5N1Kiue4C
// SIG // BmffCZfnxhgTMjAyNTA0MDEwOTE0NTcuNjYzWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjM3MDMt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
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
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDTTCC
// SIG // AjUCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
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
// SIG // hkiG9w0BAQsFAAIFAOuWDZMwIhgPMjAyNTA0MDEwNzAw
// SIG // MzVaGA8yMDI1MDQwMjA3MDAzNVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65YNkwIBADAHAgEAAgIM3DAHAgEA
// SIG // AgISszAKAgUA65dfEwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBg0vkmGXBs
// SIG // cK6cXiFAD7zP1tGkUKmrQdwVrLik8CMc67SyVeyWH5P5
// SIG // TfbOyWT6Anaytpne52ovhgxbICcm4/NnoLlxnqc+SNMm
// SIG // gnNYkUiJ2hVStbSoJBwvUP4rxhIQuYQO4JbechW7whPF
// SIG // 2vZdNc6PdxnJoaXywipNO9fIBL+FBj/Bnq6ddNBFlg4Q
// SIG // 9H35F+zMQkUucNCIvqg+Ns/8FsA0u+Qhb8BtpiJR65we
// SIG // Ioxsp9d8mbWoedcKhsMCgwKTztaCwhJGbiIweN8OJ9qt
// SIG // SmjfIGZIlo1XQVm1zza+cj4LmI+LSQiXdtnUR/wK9jhe
// SIG // JwzqZuxd/ekS5D0APpC1KRKmMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIK
// SIG // R7IU2e6ysw8AAQAAAgowDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgrJH7+CBQCC3O0nA288tsFYZYs9fl
// SIG // Fjes3oSqoNGQWsswgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBNmsv8tHqSv192dNyk3JaKhPLvSF0bXTuz
// SIG // HsdIcPfkmjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACCkeyFNnusrMPAAEAAAIKMCIE
// SIG // IJAXt0UxK7kX7arrdTE+UIopPy8ZCsTk1qARI0JuWqDX
// SIG // MA0GCSqGSIb3DQEBCwUABIICAJIOA2x3XNOTGPtH20B8
// SIG // 7qLDXSlypTfLdKq3fN2a9JqWGcD2acfKCz7zxz7Mk7g8
// SIG // mCqxJrK0tc/CrDppi1qBjOeO5/1iegYnvxBKUQKluaf6
// SIG // btcnx075Wda3Zocs98ZHDvFusCEiplAX2/qJvmNuKuHH
// SIG // 03VmpWCbOnd5DYa+qtveQ6gxCzk6Lq1y3Zv0xrClUBiV
// SIG // ZmBSughIJYZuV1p4uLr/QvxaLBzhejg/Pw+AbaRvjB9l
// SIG // whs2+E5Jjsx+1xYdKHoHVndRnF1gXeXU6l3IP8CDk0uN
// SIG // lzXsjM93F6TBp5UBMIXYmBpozXDulvPL1u8NwFkhf+jy
// SIG // bLx0zMzWEq3x7IZBds/DSIBiCuOV2ZlkBdYEdssXHmZ3
// SIG // BlSlCFL+HiWgKAYrn4f0ulu1KDrxPoSe5rvtNIF8sXMb
// SIG // YUvYFVjV3BZD3irUxT8koO52RIOBqcPPiT7Sd8Pml9VN
// SIG // eSyOIHa2Rv0jvSZZhciwmhSCo0D8mReFRoOMrmcpzr+q
// SIG // bRakTBSQTZ9XWd+on5hnB5bSgYu+W6WAI+5CKKr/UKWe
// SIG // uslnOXcPnN1wTD9qNs8cMMpBG3nAwgEK4oZpCHk1JfRP
// SIG // KIhKEBfExI6csVbs/yoiBWG4i2G38TkYG9A4o/sl2BKD
// SIG // LM9APiqVQVgfzkG6+YG2MJUvuxiFZefWwHbX6v1HZslU
// SIG // GLYd
// SIG // End signature block
