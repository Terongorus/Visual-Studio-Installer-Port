// Copyright (c) Microsoft Corporation. All rights reserved.
"use strict";
var path = require("path");
var fs = require("fs");
var Components = (function () {
function Components(environmentPaths, workingDirectory) {
this.environmentPaths = environmentPaths;
this.workingDirectory = workingDirectory;
this.cachedPaths = {};
}
Components.prototype.getComponentPath = function (componentName) {
var componentPath = this.cachedPaths[componentName];
if (!componentPath) {
componentPath = computePath(componentName, this.workingDirectory, this.environmentPaths);
this.cachedPaths[componentName] = componentPath;
}
return componentPath;
};
Components.prototype.getRelativeComponentPath = function (mainComponentName, relativeComponentName) {
var relativeComponentPath = this.cachedPaths[relativeComponentName];
if (!relativeComponentPath) {
relativeComponentPath = computeRelativePath(relativeComponentName, this.getComponentPath(mainComponentName));
this.cachedPaths[relativeComponentName] = relativeComponentPath;
}
return relativeComponentPath;
};
Object.defineProperty(Components.prototype, "bower", {
get: function () {
return getComponent(this.getComponentPath('bower'));
},
enumerable: true,
configurable: true
});
Object.defineProperty(Components.prototype, "bowerConfig", {
get: function () {
return getComponent(this.getRelativeComponentPath('bower', 'bower-config'));
},
enumerable: true,
configurable: true
});
Object.defineProperty(Components.prototype, "npm", {
get: function () {
return getComponent(this.getComponentPath('npm'));
},
enumerable: true,
configurable: true
});
Object.defineProperty(Components.prototype, "gulp", {
get: function () {
return getComponent(this.getComponentPath('gulp'));
},
enumerable: true,
configurable: true
});
return Components;
}());
function getComponent(componentPath) {
return require(componentPath);
}
function computePath(componentName, workingDirectory, environmentPaths) {
for (var index = 0; index < environmentPaths.length; index++) {
var environmentPath = path.resolve(workingDirectory, environmentPaths[index]);
var resultPath;
var cmdPath = path.join(environmentPath, componentName + '.cmd');
if (!fs.existsSync(cmdPath)) {
continue;
}
var dotBinPath = 'node_modules' + path.sep + '.bin';
if (environmentPath.indexOf(dotBinPath, environmentPath.length - dotBinPath.length) > 0) {
resultPath = path.resolve(environmentPath, '..', componentName);
if (fs.existsSync(resultPath)) {
return resultPath;
}
}
resultPath = path.join(environmentPath, 'node_modules', componentName);
if (fs.existsSync(resultPath)) {
return resultPath;
}
resultPath = path.join(environmentPath, componentName, 'node_modules', componentName);
if (fs.existsSync(resultPath)) {
return resultPath;
}
}
return componentName;
}
function computeRelativePath(componentName, workingPath) {
if (workingPath) {
try {
var packageJsonPath = path.join(workingPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
var packageJsonContent = '' + fs.readFileSync(packageJsonPath);
var packageJson = JSON.parse(packageJsonContent);
if (packageJson.main) {
var mainPath = path.join(workingPath, packageJson.main);
if (fs.lstatSync(mainPath).isDirectory()) {
workingPath = mainPath;
}
else if (fs.lstatSync(mainPath).isFile()) {
workingPath = path.dirname(mainPath);
}
}
}
}
catch (e) {
}
if (path.basename(workingPath) != 'node_modules') {
workingPath = path.join(workingPath, 'node_modules');
}
while (workingPath.length > 3) {
var resultPath = path.join(workingPath, componentName);
if (fs.existsSync(resultPath)) {
return resultPath;
}
workingPath = path.dirname(workingPath);
}
}
return componentName;
}
var workingDirectoryCache = {};
module.exports = function (workingDirectory) {
var components = workingDirectoryCache[workingDirectory];
if (!components) {
components = new Components(process.env['PATH'].split(';'), workingDirectory);
workingDirectoryCache[workingDirectory] = components;
}
return components;
};

// SIG // Begin signature block
// SIG // MIIoKwYJKoZIhvcNAQcCoIIoHDCCKBgCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // AG4ngMnpKBeWYmX/+q/lmtRjLC5uRmOn6aJXbfjbQJKg
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAABARsdAb/VysncgAA
// SIG // AAAEBDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExNFoX
// SIG // DTI1MDkxMTIwMTExNFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // tCg32mOdDA6rBBnZSMwxwXegqiDEUFlvQH9Sxww07hY3
// SIG // w7L52tJxLg0mCZjcszQddI6W4NJYb5E9QM319kyyE0l8
// SIG // EvA/pgcxgljDP8E6XIlgVf6W40ms286Cr0azaA1f7vaJ
// SIG // jjNhGsMqOSSSXTZDNnfKs5ENG0bkXeB2q5hrp0qLsm/T
// SIG // WO3oFjeROZVHN2tgETswHR3WKTm6QjnXgGNj+V6rSZJO
// SIG // /WkTqc8NesAo3Up/KjMwgc0e67x9llZLxRyyMWUBE9co
// SIG // T2+pUZqYAUDZ84nR1djnMY3PMDYiA84Gw5JpceeED38O
// SIG // 0cEIvKdX8uG8oQa047+evMfDRr94MG9EWwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFPIboTWxEw1PmVpZS+AzTDwo
// SIG // oxFOMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDI5MjMwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCI5g/S
// SIG // KUFb3wdUHob6Qhnu0Hk0JCkO4925gzI8EqhS+K4umnvS
// SIG // BU3acsJ+bJprUiMimA59/5x7WhJ9F9TQYy+aD9AYwMtb
// SIG // KsQ/rst+QflfML+Rq8YTAyT/JdkIy7R/1IJUkyIS6srf
// SIG // G1AKlX8n6YeAjjEb8MI07wobQp1F1wArgl2B1mpTqHND
// SIG // lNqBjfpjySCScWjUHNbIwbDGxiFr93JoEh5AhJqzL+8m
// SIG // onaXj7elfsjzIpPnl8NyH2eXjTojYC9a2c4EiX0571Ko
// SIG // mhENF3RtR25A7/X7+gk6upuE8tyMy4sBkl2MUSF08U+E
// SIG // 2LOVcR8trhYxV1lUi9CdgEU2CxODspdcFwxdT1+G8YNc
// SIG // gzHyjx3BNSI4nOZcdSnStUpGhCXbaOIXfvtOSfQX/UwJ
// SIG // oruhCugvTnub0Wna6CQiturglCOMyIy/6hu5rMFvqk9A
// SIG // ltIJ0fSR5FwljW6PHHDJNbCWrZkaEgIn24M2mG1M/Ppb
// SIG // /iF8uRhbgJi5zWxo2nAdyDBqWvpWxYIoee/3yIWpquVY
// SIG // cYGhJp/1I1sq/nD4gBVrk1SKX7Do2xAMMO+cFETTNSJq
// SIG // fTSSsntTtuBLKRB5mw5qglHKuzapDiiBuD1Zt4QwxA/1
// SIG // kKcyQ5L7uBayG78kxlVNNbyrIOFH3HYmdH0Pv1dIX/Mq
// SIG // 7avQpAfIiLpOWwcbjzCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoNMIIaCQIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCCXZpt3CnCd4RXL2HgRRXjVpyAwjkOIlZFp
// SIG // RRO2ZCeVeDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBALJwT8Df
// SIG // HI9Zn00lp5Qgs9SsiKfVt74WjCwcwuS05tI4rP/K8k3+
// SIG // gin6Q7+zlYxW8WVapCqKUaVAaAzH1J8dtaLFN8G7/iFJ
// SIG // LAIMYGip9msc+g4JwWTRbFikfjQjXiZB79DDmzi4qvj5
// SIG // 485VyDz7QcCP6HLqhkonuVQuhwBDDqm0e9ZM0MDzMfrU
// SIG // rd5HyoL/+dhbw4xPp7RU167LVlqB1Z1vlPdbnxtpTWv/
// SIG // VCRal0l7RzdLGBC254xrK1XtaFmIMTI2OpOPkbfdU4nK
// SIG // /N657PtZPAdUirjFR80PmFrMLFR8qq0DYl9F3qyBQQEW
// SIG // 6QEnmrm54++Mle284fwyyCt6SYyhgheXMIIXkwYKKwYB
// SIG // BAGCNwMDATGCF4Mwghd/BgkqhkiG9w0BBwKgghdwMIIX
// SIG // bAIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgtYnZ2PsnO1uUhImuLB7g
// SIG // ck95kUNHNyRMmL7t2j0ikX0CBmhLQWUjThgTMjAyNTA3
// SIG // MDgwMTAyMTkuMjE5WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOkYwMDItMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR7TCCByAwggUIoAMCAQICEzMAAAIFPHVsgkSHzf4A
// SIG // AQAAAgUwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjUwMTMwMTk0MjQ5WhcN
// SIG // MjYwNDIyMTk0MjQ5WjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkYwMDItMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAkpLy33e4Bda9sBnc
// SIG // vOQhWFx1AvMsBMg+C0S79FmBF3nmdLuWLiu6dnF1c0Jm
// SIG // Tzh0zfE1qhtkj5VG/uz5XcxQwwJUd71PKYjo5obvax1u
// SIG // NzNnW6K/Y5fYJboc8FHdknIlRmu3/beu7TNyhSkUjFxb
// SIG // RyhdysAQe2laPm9asuafQ1paNjeRRqwahzBFZTcs63h2
// SIG // KAyy/pvH0rKjLv4mFKscyuReEuyGOTXpgAfAfgN0IMFS
// SIG // IuuCiSH3imVHoligk3+KHVID9wEIpcYePD+s+wE+CANH
// SIG // TBLSoWCxbOFvyjQzLGK+yqUDylQnAuRPLgx3SnsLm8s3
// SIG // p5E8cuH39Td4PMoaOT4vQX40dFcra5JqQ33qfCT8HG+A
// SIG // TTiFzqNaX3R2fBL50eyRWRUIqqTGRZTuQgLk2B/Lo3OT
// SIG // 1B5WjACfDRGvUxSUzkgawez0YHof+jSdsbvcsT4f5FTf
// SIG // QRrLPdzAulI6aMXjOMe9G8G8IivEjRyDvA/HKpe1Unr1
// SIG // GG4zeDaIBRcIQQpYaHRP83hj6usuosQ+M+uSB2N88BUG
// SIG // wVV/8Pi/1RzZ/wTBrNjxh55UYzvypPDSKTeLIZBUKgNX
// SIG // zNPH66w0jRGPVSg7abFKQBedWNaEOrSYVjNXd53gl4em
// SIG // /+jfl3hzkQsJ2PNyvqRTDIYPIrF0G+ikZeuZIPF2AXeC
// SIG // cJGyqFUCAwEAAaOCAUkwggFFMB0GA1UdDgQWBBR0elq7
// SIG // Nu2+vsid2xGfaOTXS9Wy8DAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // DrsZOO29Yu+VfNU8esaNdMTSK+M2cWFX5BeUxatpJ3Tx
// SIG // 4M1ci57LMPxypBGUQoGVaZChCemOI7xubboDIvlo7e4V
// SIG // DEoqZPkaQeYBUL4dcZgBC9n5XoM01hLJ49MKxEqZSOWd
// SIG // 74H9nhlwK/0XKho0qaLh2w9h2PWNxdDpehUQwlfxxBik
// SIG // R859jOa0KRRko2nE+A5KlWJnpvwKzn0r1aI5yhCFvdeF
// SIG // MRrboSUq/YzqOUak1+xiKm7bze84VpXfot18XYXTXH5U
// SIG // M/WIaBakHsQXp6CEYADwLcB+vMXM6/SzAt5fQCxKZ7Lz
// SIG // tEYij1xeJdtvzn3BX32qYZ5f0w8JIiX8TsgDH1Bd8SPf
// SIG // t4s09Vl9ghbNkWjgKt3XKIcicPsURtBPMJAh6pFeewW1
// SIG // ARMy1/C/ZRidQ6MWDaaA1+4kMyfUHZMqYuX7++9xNwof
// SIG // APraMXhaehYn0GcgnPCHCAZR8mpOjG0+mE1UDYEP4fBR
// SIG // fkuTqj+whAhbyB9irdj9BpTrvQtAX2rIZ046HZrWRWbK
// SIG // bVL4q5P9hziy4wYjIw8CbEABQMybs+GbU8qK67xEddBp
// SIG // f5m5lYh6obzQAn08z4i34w4Mr6fbO/2x7vwmpSpnoiVC
// SIG // xo4f5cAI+d9faYILBiam4SeBWxXPqFOc3325v6yo1WfJ
// SIG // MTQ94ptdEKeNZ9rf6qcj+hEwggdxMIIFWaADAgECAhMz
// SIG // AAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUA
// SIG // MIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAx
// SIG // ODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // 5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1
// SIG // V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeF
// SIG // RiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDc
// SIG // wUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus
// SIG // 9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130
// SIG // /o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHI
// SIG // NSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTes
// SIG // y+uDRedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGp
// SIG // F1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+
// SIG // /NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fz
// SIG // pk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNO
// SIG // wTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLi
// SIG // Mxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5
// SIG // UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9Q
// SIG // BXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6H
// SIG // XtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIG
// SIG // CSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYE
// SIG // FCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSf
// SIG // pxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEG
// SIG // DCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3Mv
// SIG // UmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUH
// SIG // AwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0w
// SIG // Ni0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1Vffwq
// SIG // reEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1
// SIG // OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpT
// SIG // Td2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinL
// SIG // btg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l
// SIG // 9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJ
// SIG // w7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2Fz
// SIG // Lixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7
// SIG // hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY
// SIG // 3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFX
// SIG // SVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFU
// SIG // a2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz
// SIG // /gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/
// SIG // AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1
// SIG // ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328
// SIG // y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEG
// SIG // ahC0HVUzWLOhcGbyoYIDUDCCAjgCAQEwgfmhgdGkgc4w
// SIG // gcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1p
// SIG // Y3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNV
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjpGMDAyLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUA1bB/adbSZ/pK
// SIG // 8AjL6joVb1623rSggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOwW
// SIG // s0wwIhgPMjAyNTA3MDcyMDU3NDhaGA8yMDI1MDcwODIw
// SIG // NTc0OFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA7Baz
// SIG // TAIBADAKAgEAAgIixQIB/zAHAgEAAgIScjAKAgUA7BgE
// SIG // zAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQCaH8aBuKMi4wGNWNslmaKf7TcN
// SIG // HqHFeDWSheZXp+VdSczePIyB4LtnYciPWLARuHPCFa2S
// SIG // PEZxcSVHYOy0ait+02sxPCv7qUzr1jtTskkSMIOvNvfZ
// SIG // 9IIn9uf5tdS4I3y9CckSCfNza3iZ4zy6OJqbHJDAUad0
// SIG // Vlkvl4gQfkT53ANXHWpdhoVf4FlKoOeaRs8Xfpaal17t
// SIG // mamxsr4qOM/F/71LiUyhAMk0sihIjwX2agO3izQj3Cd0
// SIG // /hEpnDLNnu8/teCCqtY3wp7RIPKvOd8wgfxfT/E5G00X
// SIG // q8vVte5D4mrB31RBLg8xrfYC91nhJyIV6t7+jna9m1kA
// SIG // uNYrH70tMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAIFPHVsgkSHzf4AAQAA
// SIG // AgUwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // TKlBjfi7dvG+aSmrcPVevxljDFaB1JikA+2kN+PWOOow
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCADQM9
// SIG // 3HmNLpoXVi0drCaatDj6rSQ0wGEZox1ZMBFvSDCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAACBTx1bIJEh83+AAEAAAIFMCIEIGWKRUFXvvsqK1Ld
// SIG // uPrEPMeGWP/Lc1y7ZOCoYR9HOFoIMA0GCSqGSIb3DQEB
// SIG // CwUABIICABpqC3HxlxFnjpBdIHl+3lOAZWGz/pIinhr8
// SIG // hLjGEUr91ypUZR050x63varbLAzxq2EL2BqkEXB+tf1h
// SIG // rSKo5zq/zVfNqEHo3v06ETsb0sPGbq8Hbd6OyMWdjAcw
// SIG // BubTvCXdlHW7Wm8gYOuQi0goSd4jZ84Q6M+tXW4kJLqH
// SIG // utJ9L0fmei/V/aLUCKuUFQqPm6lP7ACd772aL4iwsV5A
// SIG // BZYmRm2/vJpkjPHpFldnpSK+GChF90ttuyMtQWl+BQgv
// SIG // zzSJ5WwOEFU03f0r87f4wYjOSjRQ0R1HpsESDq9NFtaF
// SIG // 7CDAEUQDEnhEHh79qabSShy9dor1YxvLO0Dyw2+zAYlZ
// SIG // 5/OJN2sDVO2xsyYhFXHwuzcndWF4PT384S/bFtIL/YfL
// SIG // rPZV+0hXpP3WbXg+Axms3EEw7TPC7jlLoA9C0CXcHaVQ
// SIG // PPmgpU5CIh9X19pkcM+UC5QKplv6YPRcfTfbXKqZTMME
// SIG // 3zXFHIRxxYcwWV2cvaKchQjH2E9nmkJ1cZmKQHhDRDpf
// SIG // 3rlfamtyTZ9UMyq2g3S0u9watDaMmqsYeOvZ4mIwLT0K
// SIG // j39Zo0j0kXWz7uexJfDu+CpFcecT/SsMueYVoQM7g0Xw
// SIG // JWK8h0wCKSVNctu0w6N4kR/xObxzi5zlPvvKvxG/cbbe
// SIG // S2g8jEAEiAY9GX39yEzIHMTFWwYex2Np
// SIG // End signature block
