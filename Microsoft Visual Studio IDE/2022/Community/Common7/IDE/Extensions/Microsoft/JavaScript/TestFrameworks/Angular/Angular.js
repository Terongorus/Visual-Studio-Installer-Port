// @ts-check
"use strict";
const fs = require('fs');
const os = require('os');
const path = require('path');
const { fork } = require("child_process");

process.env.VSTESTADAPTERPATH = __dirname;

const vsKarmaConfigFilePath = path.resolve(__dirname, "./karmaConfig.js");

function getTestProjects(configFile) {
    const configDirPath = path.dirname(configFile);

    const angularProjects = [];
    const angularConfig = require(configFile);
    for (const projectName of Object.keys(angularConfig.projects)) {
        const project = angularConfig.projects[projectName];

        const karmaConfigFilePath = project.architect.test
            && project.architect.test.options
            && project.architect.test.options.karmaConfig
            && path.resolve(configDirPath, project.architect.test.options.karmaConfig);

        if (karmaConfigFilePath) {
            angularProjects.push({
                angularConfigDirPath: configDirPath,
                karmaConfigFilePath,
                name: projectName,
                rootPath: path.join(configDirPath, project.root),
            });
        }
    }

    return angularProjects;
}

const find_tests = async function (configFiles, discoverResultFile) {
    const projects = [];

    for (const configFile of configFiles.split(';')) {
        const configDirPath = path.dirname(configFile);

        if (!detectPackage(configDirPath, '@angular/cli')) {
            continue;
        }

        projects.push(...getTestProjects(configFile));
    }

    process.env.TESTCASES = JSON.stringify([{ fullTitle: "NTVS_Discovery_ThisStringShouldExcludeAllTestCases" }]);
    process.env.ISDISCOVERY = 'true';

    const testsDiscovered = [];

    for (const project of projects) {
        // Loop each project one by one. I'm not sure why multiple instances gets locked. We do receive an Angular warning
        // on a lock file for building the project, that might be the reason.
        await new Promise((resolve, reject) => {
            const ngTest = fork(
                path.resolve(project.angularConfigDirPath, "./node_modules/@angular/cli/bin/ng"),
                [
                    'test',
                    project.name,
                    `--karma-config=${vsKarmaConfigFilePath}`,
                    '--progress=false'
                ],
                {
                    env: {
                        ...process.env,
                        PROJECT: JSON.stringify(project)
                    },
                    cwd: project.angularConfigDirPath,
                }).on('message', message => {
                    testsDiscovered.push(message);

                    // We need to keep track and communicate when we have received a testcase because the IPC channel
                    // does not guarantees that we'll receive the event on the order it has been emitted.
                    // Send to the child process as simple signal that we have parsed the testcase.
                    ngTest.send({});
                }).on('error', err => {
                    reject(err);
                }).on('exit', code => {
                    resolve(code);
                });
        });
    }

    // Save tests to file.
    const fd = fs.openSync(discoverResultFile, 'w');
    fs.writeSync(fd, JSON.stringify(testsDiscovered));
    fs.closeSync(fd);
}

const run_tests = async function (context) {
    for (const testCase of context.testCases) {
        context.post({
            type: 'test start',
            fullyQualifiedName: testCase.fullyQualifiedName
        });
    }

    // Get all the projects
    const projects = [];
    const angularConfigDirectories = new Set();
    for (let testCase of context.testCases) {
        if (!angularConfigDirectories.has(testCase.configDirPath)) {
            angularConfigDirectories.add(testCase.configDirPath);

            if (!detectPackage(testCase.configDirPath, '@angular/cli')) {
                continue;
            }

            projects.push(...getTestProjects(`${testCase.configDirPath}/angular.json`));
        }
    }

    // Set the environment variable to share it across processes.
    process.env.TESTCASES = JSON.stringify(context.testCases);

    for (const project of projects) {
        // Loop each project one by one. I'm not sure why multiple instances gets locked. We do receive an Angular warning
        // on a lock file for building the project, that might be the reason.
        await new Promise((resolve, reject) => {
            const ngTest = fork(
                path.resolve(project.angularConfigDirPath, "./node_modules/@angular/cli/bin/ng"),
                [
                    'test',
                    project.name,
                    `--karma-config=${vsKarmaConfigFilePath}`
                ],
                {
                    env: {
                        ...process.env,
                        PROJECT: JSON.stringify(project)
                    },
                    cwd: project.angularConfigDirPath,
                    stdio: ['ignore', 1, 2, 'ipc'] // We need to ignore the stdin as NTVS keeps it open and causes the process to wait indefinitely.
                }).on('message', message => {
                    context.post({
                        type: message.pending ? 'pending' : 'result',
                        fullyQualifiedName: context.getFullyQualifiedName(message.fullName),
                        result: message
                    });

                    ngTest.send({});
                }).on('exit', code => {
                    resolve(code);
                }).on('error', err => {
                    reject(err);
                });
        });
    }

    context.post({
        type: 'end'
    });
}

function detectPackage(projectFolder, packageName) {
    const packagePath = path.join(projectFolder, 'node_modules', packageName);

    if (!fs.existsSync(packagePath)) {
        logError(
            `Failed to find "${packageName}" package. "${packageName}" must be installed in the project locally.` + os.EOL +
            `Install "${packageName}" locally using the npm manager via solution explorer` + os.EOL +
            `or with ".npm install ${packageName} --save-dev" via the Node.js interactive window.`);

        return false;
    }

    return true;
}

function logError() {
    var errorArgs = Array.from(arguments);
    errorArgs.unshift("NTVS_ERROR:");
    console.error.apply(console, errorArgs);
}

module.exports.find_tests = find_tests;
module.exports.run_tests = run_tests;
// SIG // Begin signature block
// SIG // MIIoUwYJKoZIhvcNAQcCoIIoRDCCKEACAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 0N4rnUDws5t5+vVuhOQwwKAWBYrLeRcYXPAvkgGLPCKg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAX77pC/1+KpOe7
// SIG // YLHWXEG1izjKWi3324hpRKOSt5sUljBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBABju368glejf5UkSlUNIXlhKEOE+gUU2
// SIG // uMStz17HuvX8VEd9I6miyZ1k38O0aCwSjX9XtqXyXhMp
// SIG // PQIk/CblsuaGd+SeAzfa6rVYGfMLV2ux1U6s9Bc6JLOO
// SIG // j93V5F/POAydKlWq3B9IbigCF/yNq3EDTE5j9rp3317k
// SIG // hzYSKyUviIjGsQN5c5Sh4navHC5ZZ9PLf0+UndZ4++qf
// SIG // fBLZo3T4Z8B8NAiCGe+j9ZKGDX+XTd1tDdNuT8HHwprC
// SIG // XW2CwVu9Alo0mkekp+HkKydBzv3GbTsJtBXurNRo/ADQ
// SIG // +b9pcnVCDz0wa96tLmGch9EP2qKz3H/wc7+OZyj8X5Jj
// SIG // zKKhghewMIIXrAYKKwYBBAGCNwMDATGCF5wwgheYBgkq
// SIG // hkiG9w0BBwKggheJMIIXhQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // c1UlSUkXlbiJShTTrCIAWUqwM2HOhkel13ICcep/rjIC
// SIG // Bme2NzlN3BgTMjAyNTA0MDEwOTE2MDIuNTI3WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046MkExQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH+MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfkfZ411q6TxsQABAAAB+TANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMDlaFw0yNTEwMjIxODMx
// SIG // MDlaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjoy
// SIG // QTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBALQ9TB98gB1hzVbJQvgg
// SIG // U4/zKXeeSwz7UK4Te1nqhYUXgvcSl0o6G1tWR8x1PFdg
// SIG // TiVImIO3wydgMRlRsqL1LYBmYNvhmrhSpN2Y47C0rKno
// SIG // WCLFEK4F/q/1QE2lvPzjVsupTshmcGacX1dhF+KgIepm
// SIG // 9oWnQLr3W0ZdUCtbXwZUd33XggUBvsm8/SRWeOSzdqbP
// SIG // DXNca+NTfEItylSS2F9ImxGwJJLEeG27Mws72Pr3Uq41
// SIG // sigI0emIGIWgWg8RNigydrEERRRf3oAsSoKIHRd1SCaA
// SIG // hP1rsvTLhIMqXmtR3ou5RRr3S0GR+SaNkEebjfIYjHPG
// SIG // eO0USbiFgjnsiCdWJ0Yoom6VGe9vsKb/C06L9Mh+guR0
// SIG // fw/PgE+L6rT+eyE17A/QzzqG/LY7bHnz3ECXm1DYqsn8
// SIG // ky+Y+fyftnfhjwnFxGKHlmfp67GUn63eQxzOKLwpg95Y
// SIG // n4GJ84zq8uIIUE/3L5nR8Ba+siRqYVvxxvBkHfnAeMO8
// SIG // BqToR1SW8uOJBlSvDM2PbN9g8tUx5yYPKe8tbBBs/wNc
// SIG // vOGbeoCLCE2GnHB4QSqeHDlTa36EVVMdhv9E6+w5N36Q
// SIG // lPLvuaJajz8CoGbOe45fpTq0VbF9QGBJgJ8gshq6kQM6
// SIG // Rl8pNR7zSAaUjTbkwUJOxQb7vmKYugO0tldk4+pc2FlQ
// SIG // b7hhAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUie2jupyV
// SIG // ySPXoo80uUJEdkZZ4AAwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBAGYg
// SIG // CYBW5H+434cf5pmZZxma6WnvhxqcVsbPCO/b1G/BkKLu
// SIG // dDNZ7O4sBtgnHaF2qu1YKVZDX9bryIaxmKSggV0Pkmid
// SIG // jtAb8LiUe1LIE2ijdI/8n936Rw9JLR/hJBLhl7PQwS8r
// SIG // e9YrrVZMKMPYkJkpOKCCvEvAKzRqUjs3rrvU3SYwY7Gr
// SIG // JriftquU45q4BCsj3t0wKQIqPHHcP29XAQJo7SO7aTWF
// SIG // eT8kSNytTYbg4HxI+ZMpxhf7osz9Tbh0sRf1dZLP9rQh
// SIG // KK4onDOJNTyU0wNEwozW5KZgXLADJcU8wZ1rKpwQrfXf
// SIG // lHfVWtyMPQbOHHK5IAYy7YN72BmGq+teaH2LVPnbqfi7
// SIG // lNHdsAQxBtZ4Ulh2jvrtsukotwGjSDbf6TjClOpeAFtL
// SIG // g1lB9/Thx9xKhR7U7LGV2gzo7ckYG6jBppH/CiN6iFQW
// SIG // Sdl0KZ4RLkW4fgIKZkZ/2uNdA5O1bT4NrguNtliwvB/C
// SIG // FZPxXqIkkuLxaHYZ3BXrSdGSt+sMQGtxYj4AXm0VslbW
// SIG // e+t6gw88Q29Jgehy/RxH02zfuKBwpGWtRypfAdLPEYhQ
// SIG // TH/1u/juxD2fsDB/MHZI2e0m7HXbXUYEQEakfCBT1rq0
// SIG // PrJ+37RIn2qI87ghGoUgHKvOso8EHkzzfWBvW9+EU7q5
// SIG // 5KQ/sDxkwdVnHDKbC5TNMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046MkExQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAKrO
// SIG // Vo1ju81QCpiHHcIaoGb8qelGoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlhc7MCIYDzIwMjUwNDAxMDc0MTQ3WhgPMjAy
// SIG // NTA0MDIwNzQxNDdaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOuWFzsCAQAwCgIBAAICCWoCAf8wBwIBAAICE14w
// SIG // CgIFAOuXaLsCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQsFAAOCAQEAb4FKoRmmPxlNG6xa
// SIG // vvVTuWMLZwPN7nAOk8hq78UrrOh8u6A2yBGn6rrrU+Qd
// SIG // e+bjL73pa2CB31ynTVMHUDkR/ZRljwtee1kbYB2SEzMV
// SIG // utGyu6CaVWdwprZdMDLkU0PWVMQ2xgwxfwxY7GJcgjSE
// SIG // MTNRS47Csbskw/9RO6ZdoOSIsDtRp3JwxMbPrXPNcqvx
// SIG // aNBbfOUY/NjSkYz2gjIf4vzBMGOoYGsceofEkRw3tGss
// SIG // yc0ib0Pz0IRuwW5+8FYrQSKrIJBtr7DUgxi0hAPZwIGM
// SIG // U0rPvyjIhvc2+wT8b1fX36mNYogHD6vHBTLKky+WbZh+
// SIG // c6Ikx1NiJUA0fQGwHjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB+R9njXWr
// SIG // pPGxAAEAAAH5MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEIB+80pWIg4Go56yS3dasM92AJ9sICQFk6t80
// SIG // YDDTO8ttMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgOSOMyB7wjftk+ukVDiwma1BFXaCpSpfFXgjuUmxi
// SIG // 2BAwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAfkfZ411q6TxsQABAAAB+TAiBCB9D/5f
// SIG // ktjG7DqG+bFEmtTc309tozBontXcDZMLkcghjjANBgkq
// SIG // hkiG9w0BAQsFAASCAgBnZfb8YJ71r0Tsig5bzX2Yn+tC
// SIG // JneYAMn+vw10UOK0kT8DflhEZtAUJ+Na9RtxYOmYXah6
// SIG // N9FBSCc0mlyvkw+ihs/2GjNs87aKw1mcKbWXkHXGFlCR
// SIG // LUvizidjDyfcD2K0bx2lB4WOWIX222SIssI55HeQewDv
// SIG // ezWh3cq4cg+xZKQI1UB9C7IfCSRdL7anmCErf+mOzM+9
// SIG // v7I1Mj1M9F1qDPos95/EE/DTnVkavEIG1afMVuIxmMk/
// SIG // YCQhbGSpA3rrBkTNDI9edeIS/dikoewAJpx1pIwJXG6s
// SIG // JbsccfrNSVY86EWL4lltZ3BfM2cucHeHVsBePTX+Jgcu
// SIG // rpsOYhy2AOHOV5W6sD/nuwHuV5dl0X0Z1u0GSj3H1Tqk
// SIG // PCx4b9kmnQzLYW6dzniFBNMcX7vvGDJvoNwPv288Wkwq
// SIG // fD7j3EjjRZMfyY3RvSX4bWDXNKCpi9yJCIErpV4AySgD
// SIG // ClNCWbCkZTlc9FfOHL2FgxflGCfX0I7jOiUJf5oQOXrS
// SIG // fkifF8dNUu3AL2Y4cH3ZaD5NBMy90PjHtSL4XjK5AOn8
// SIG // CYADk7zar5/aKy8NpFwQNs6Le316LTuYDftyZD2cMHTb
// SIG // fNjS9sUlVDEdk1wJ4NpVDgGL05f+iIEVoBPMCCYIse/j
// SIG // JSv9TFfZGV7/hNtU9kpu/pwt4pQ/8m2donw1nQ2E/Q==
// SIG // End signature block
