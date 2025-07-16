// @ts-check
"use strict";

var EOL = require("os").EOL;
var fs = require("fs");
var path = require("path");

var defaultJasmineOptions = {};

function logError(...args) {
    var errorArgs = Array.prototype.slice.call(arguments);
    errorArgs.unshift("NTVS_ERROR:");
    console.error.apply(console, errorArgs);
}

function getJasmineOptionsPath(projectFolder) {
    return path.join(projectFolder, "test", "jasmine.json");
}

function detectJasmine(projectFolder) {
    try {
        var node_modulesFolder = path.join(projectFolder, "node_modules");
        var options = loadJsonOptions(getJasmineOptionsPath(projectFolder));
        if (options && options.path) {
            node_modulesFolder = path.resolve(projectFolder, options.path);
        }
        return require(path.join(node_modulesFolder, "jasmine"));
    }
    catch (ex) {
        logError('Failed to find Jasmine package. Jasmine must be installed in the project locally.' + EOL +
            'Install Jasmine locally using the npm manager via solution explorer' + EOL +
            'or with ".npm install jasmine --save-dev" via the Node.js interactive window.');
    }
    return null;
}

function loadJsonOptions(optionsPath) {
    if (fs.existsSync(optionsPath)) {
        return require(optionsPath);
    }
}

function loadJasmineOptions(projectFolder) {
    var options = loadJsonOptions(getJasmineOptionsPath(projectFolder));
    if (options && options.configFile) {
        var optionsPath = path.join(projectFolder, "test", options.configFile);
        options = loadJsonOptions(optionsPath);
    }
    return options;
}

function mergeOptions(target, source) {
    for (var opt in source) {
        target[opt] = source[opt];
    }
}

function getJasmineOptions(projectFolder) {
    var jasmineOptions = defaultJasmineOptions;
    try {
        var options = loadJasmineOptions(projectFolder);
        options && mergeOptions(jasmineOptions, options);
        options && console.log("Found jasmine.json file.");
    }
    catch (ex) {
        console.error("Failed to load Jasmine setting, using default settings.", ex);
    }
    console.log("Using Jasmine settings: ", jasmineOptions);
    return jasmineOptions;
}

function applyJasmineOptions(jasmineInstance, options) {
    if (options) {
        jasmineInstance.loadConfig(options);
    }
}

function initializeJasmine(Jasmine, projectFolder) {
    var instance = new Jasmine();
    applyJasmineOptions(instance, getJasmineOptions(projectFolder));
    return instance;
}

/**
 * @param {jasmine.Suite} suite
 * @param {object[]} testList
 * @param {string} testFile
 */
function enumerateSpecs(suite, testList, testFile) {
    suite.children.forEach((child) => {
        if (child instanceof jasmine.Suite) {
            enumerateSpecs(child, testList, testFile);
        } else {
            testList.push({
                name: child.description,
                suite: suite.description === "Jasmine__TopLevel__Suite" ? null : suite.getFullName(),
                filepath: testFile,
                line: 0,
                column: 0
            });
        }
    });
}

/**
 * @param {string} testFileList
 * @param {string} discoverResultFile
 * @param {string} projectFolder
 */
async function find_tests(testFileList, discoverResultFile, projectFolder) {
    var Jasmine = detectJasmine(projectFolder);
    if (!Jasmine) {
        return;
    }
    
    var jasmineInstance = initializeJasmine(Jasmine, projectFolder);
    setSpecFilter(jasmineInstance, _ => false);

    var testList = [];
    for (var testFile of testFileList.split(";")) {
        try {
            jasmineInstance.specDir = "";
            jasmineInstance.specFiles = [];

            // In Jasmine 4.0+ addSpecFiles has been deprecated in favor of addMatchingSpecFiles
            (jasmineInstance.addMatchingSpecFiles || jasmineInstance.addSpecFiles).apply(jasmineInstance, [[testFile]]);
            
            var p = jasmineInstance.loadSpecs();
            if (p instanceof Promise) {
                await p;
            }

            var topSuite = jasmineInstance.env.topSuite();
            // In Jasmine 4.0+ the Suite object is not top level anymore and is instead in the suite_ property
            if (topSuite && topSuite.suite_) {
                topSuite = topSuite.suite_;
            }
            
            enumerateSpecs(topSuite, testList, testFile);
        }
        catch (ex) {
            //we would like continue discover other files, so swallow, log and continue;
            console.error("Test discovery error:", ex, "in", testFile);
        }
    }

    var fd = fs.openSync(discoverResultFile, 'w');
    fs.writeSync(fd, JSON.stringify(testList));
    fs.closeSync(fd);
}

exports.find_tests = find_tests;

function createCustomReporter(context) {
    return {
        specStarted: (specResult) => {
            context.post({
                type: "test start",
                fullyQualifiedName: context.getFullyQualifiedName(specResult.fullName)
            });
        },
        specDone: (specResult) => {
            // TODO: Report the output of the test. Currently is only showing "F" for a regression.
            var type = "result";
            var result = {
                passed: specResult.status === "passed",
                pending: false
            };

            if (specResult.status === "disabled" || specResult.status === "pending") {
                type = "pending";
                result.pending = true;
            }
            context.post({
                type,
                result,
                fullyQualifiedName: context.getFullyQualifiedName(specResult.fullName)
            });
            context.clearOutputs();
        },
        jasmineDone: (suiteInfo) => {
            context.post({
                type: "end"
            });
        }
    };
}

function run_tests(context) {
    return new Promise(resolve => {
        var projectFolder = context.testCases[0].projectFolder;
        var Jasmine = detectJasmine(projectFolder);
        if (!Jasmine) {
            return resolve();
        }
        var testFileList = [];
        var testNameList = {};

        context.testCases.forEach((testCase) => {
            if (testFileList.indexOf(testCase.testFile) < 0) {
                testFileList.push(testCase.testFile);
            }
            testNameList[testCase.fullTitle] = true;
        });
        try {
            var jasmineInstance = initializeJasmine(Jasmine, projectFolder);
            jasmineInstance.configureDefaultReporter({ showColors: false });
            setSpecFilter(jasmineInstance, spec => testNameList.hasOwnProperty(spec.getSpecName(spec)));
            jasmineInstance.addReporter(createCustomReporter(context));
            jasmineInstance.execute(testFileList);
        }
        catch (ex) {
            logError("Execute test error:", ex);
        }

        resolve();
    });
}

function setSpecFilter(jasmineInstance, specFilter) {
    if (jasmineInstance.env.configure) {
        jasmineInstance.env.configure({ specFilter });
    } else {
        jasmineInstance.env.specFilter = specFilter;
    }
}

exports.run_tests = run_tests;

// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // d9ltkO9xmASUYWmjWrOLqD52dafNZUu64hMtFlYWs8Cg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC+Ub77WRciQSoM
// SIG // 5EPBZ05TxiYPDweNiq4TdmTWYeOAUTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACzxUzvMu9gXWhOkhg8gjU8efamNa/Nf
// SIG // 4hineotSdEem7XpY2BSzvL13j5Duo0MDpeq09pnUWFd4
// SIG // BXYyU2PSoB6hSxnVXo+DgsMrx4Eu5yDPrYMguCZeO8y+
// SIG // Npc7pr5EdnRZOJmwnJIPVBm+qlEk4QnlSZv2zK5BWnfq
// SIG // skgYqDxaMihgtq9rMicNMyvhXfctyE4xicecwcKgLHsF
// SIG // VhWwESyukFFsKrJiuNed9pxHuGbJNmdX6Rh++rs5ZaRh
// SIG // k09oItDpP9F/nzyGgFwWalRjTruwJ6OrzEw+pYBMOK/X
// SIG // wrvKD3tgNyILoCEBnVEHGR99G/D5KIJxBsbLBWXzFhfI
// SIG // FC+hgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // tnmofi6nCewtiq9pWPS2sUHBt88Zno4D3p3po3T8NoYC
// SIG // BmfcbUXA9xgTMjAyNTA0MDEwOTE0NTIuODE4WjAEgAIB
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
// SIG // hkiG9w0BAQsFAAIFAOuWFAowIhgPMjAyNTA0MDEwNzI4
// SIG // MTBaGA8yMDI1MDQwMjA3MjgxMFowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65YUCgIBADAHAgEAAgIZCDAHAgEA
// SIG // AgISOzAKAgUA65dligIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQCKhFM1HsPs
// SIG // BVfDYyjciVkW/kqWn0cgS0AWcb7m6J+a8aCyjn6b3DHt
// SIG // mxgw7NcVjLoj19FWnQmbg9KU6v3wApvF6H57psmYptwh
// SIG // ueDn9wPbv9zNfro0fVoBMRvyNspRCNfhgXfJG9DJhdzz
// SIG // 1SUTmQaKpwnJxQFnRSOMc3vDy8H8JOQMpOAUxPx7Bz9v
// SIG // 5N2AiJnQQZtzUgXWUccUWHZrs0Y2U2w+Fwj9rFc99938
// SIG // qdMlEdezkQBCkk3dV1uD1Fg25YQNAML81Es1a6Yhe/6u
// SIG // rmqDN28blMt4WhiGC7JGL8RwPZpU5hzlshUomLjXCOrn
// SIG // Jn/iwLH3uVZOMtH2X1BljZR8MYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIL
// SIG // EZ1WKZL5v4UAAQAAAgswDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgS7DmTbt9gWSvXEOLdeEB92JwGt5P
// SIG // q6KxyJDPznZk13UwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCA01XSruje+24dMHTshfqIETfLyiXMOY539
// SIG // vxLrLGJKMzCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACCxGdVimS+b+FAAEAAAILMCIE
// SIG // IFxv/CkUpyWaggp9fnnv5vy9eVDjtHcYXYZZ+Z8fWNQR
// SIG // MA0GCSqGSIb3DQEBCwUABIICAGNN1zZ8CeB7xM95/LDp
// SIG // l2k+2G2Eou1/gLmLRTskNJAQ+X5DxfxLKQUwI4ycxAMx
// SIG // PPDm9O/CbTDVUyhr7CN6+CNgqaa91qJTj7s1A4GEhOYy
// SIG // BdOFr7hn19QEegFO6vpFOB5+LCeNzlHAtXKWMZ/GqKqB
// SIG // A4a3kHtBXVGssKUQAOUh0/3ibx3oLBkMXkKh8jinJyn7
// SIG // vtvMlrmj71CxPfRiPMxoFjQ3HFsWjG2YEXkNJXlo5BEE
// SIG // mJTJHVSczJJc/4A4K2OYyBtKF5OCkxR7I8V8qtgzyzts
// SIG // YMSv3PL/7PO4CvqvAyKO3sP4o8kWT233ME2GtwMHiQCL
// SIG // 2jxFgCY9p2OKqpC6C6djQ/RHyQZTjaydA3I0wiXSjTH6
// SIG // O0hEklq+dAcwIOasXPJGWsx/hxIJzzkKdQbDez5elx6l
// SIG // tdtAB1bh0Ld7/0u/jYKOTmHA6WL7qaTrsE3v3TksoJVw
// SIG // w0E0j5dfEjbz9V7LUN5LVNgYtBg+ywALe+Tx6ueTXB+j
// SIG // AVBjAdVpEt3fbG7DvG8ffIEFifvbfGd0AK9QULoUlpit
// SIG // HLVhVy8ZjrutBmmNL55/IUtj8vsp3DF+U1f+0XCagJNr
// SIG // JPNhokT6TsFd67q4pTix7sc1X4FFKjgWqQFddkAMy6Sw
// SIG // jKiQFNL0Dq8ZP8EvR3F1FqALr0w+1e3GQ0HJsa8Qb87B
// SIG // Mp3B
// SIG // End signature block
