module.exports = function(grunt) {
  'use strict';

  var VS_READER_TASK_NAME = 'vs-grunt-task-reader';
  var XML_TASKS_NODE_NAME = 'tasks';
  var XML_TASK_NODE_NAME = 'task';
  var XML_NAME_NODE_NAME = 'name';
  var XML_ALIAS_NODE_NAME = 'alias';
  var XML_INFO_NODE_NAME = 'info';
  var XML_TARGETS_NODE_NAME = 'targets';
  var XML_TARGET_NODE_NAME = 'target';


  grunt.registerTask(VS_READER_TASK_NAME, 'Read grunt tasks from gruntfile.', function() {

    var tasks = [];

    var isAlias = function(task) {
      return task.info != null ? task.info.indexOf("Alias for ") == 0 : false;
    };

    var escapeXml = function (value) {
        return value.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    

    var gruntData = grunt.config.getRaw();
    var gruntTasks = grunt.task._tasks;

    Object.keys(grunt.task._tasks).forEach(function(name) {
      var task = grunt.task._tasks[name];

      if (name !== VS_READER_TASK_NAME) {
          tasks.push({ name: name, isAlias: isAlias(task), info: task.info, targets: [] });
      }
    });

    for (var task in gruntTasks) {
      if (gruntData.hasOwnProperty(task)) {

        var parentTask = null;

        for (var i = 0; i < tasks.length; i++) {
          var oldTask = tasks[i];
          if (oldTask.name === task) { 
            parentTask = oldTask;
            break;
          }
        }

        if (!parentTask) {
            parentTask = { name: task, isAlias: isAlias(task), info: task.info, targets: []};

          tasks.push(parentTask);
        }

        // Gather targets
        if (gruntData[task] === Object(gruntData[task])) {
          var arr = [];
          for (var target in gruntData[task]) {
            if (gruntData[task].hasOwnProperty(target)) {
              if (target !== 'options' &&
                  target !== 'files') {
                arr.push(target);
              }
            }
          }
          if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                parentTask.targets.push({ name: arr[i] });
            }
          }
        }
      }
    }


    grunt.log.writeln("<" + VS_READER_TASK_NAME + ">")
    grunt.log.writeln("<" + XML_TASKS_NODE_NAME + ">");

    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        var taskIsAlias = task.isAlias ? "true" : "false";
        var taskInfo = task.info ? escapeXml(task.info) : "";
        var taskName = escapeXml(task.name);

      grunt.log.writeln("<" + XML_TASK_NODE_NAME + ">");
      grunt.log.writeln("\t<" + XML_NAME_NODE_NAME + ">" + taskName + "</" + XML_NAME_NODE_NAME + ">");
      grunt.log.writeln("\t<" + XML_ALIAS_NODE_NAME + ">" + taskIsAlias + "</" + XML_ALIAS_NODE_NAME + ">");
      grunt.log.writeln("\t<" + XML_INFO_NODE_NAME + ">" + taskInfo + "</" + XML_INFO_NODE_NAME + ">");

      grunt.log.writeln("\t<" + XML_TARGETS_NODE_NAME + ">");
      for (var j = 0; j < task.targets.length; j++) {
          grunt.log.writeln("\t<" + XML_TARGET_NODE_NAME + ">" + escapeXml(task.targets[j].name) + "</" + XML_TARGET_NODE_NAME + ">");
      }
      grunt.log.writeln("\t</" + XML_TARGETS_NODE_NAME + ">");
      grunt.log.writeln("</" + XML_TASK_NODE_NAME + ">");
    }

    grunt.log.writeln("</" + XML_TASKS_NODE_NAME + ">");
    grunt.log.writeln("</" + VS_READER_TASK_NAME + ">")
  });
};

// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // NhBL4qEi82ga7gTTx16qGEOGJA+cve3LZW6FtZFaqQmg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAAuOXpMpvTX//l
// SIG // 34q2/MLH7VlyDM1+CXhnGKBWWVwBejBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAEsyV1FH0x8fnKCkV+Oiq6BkGk4Pzf44
// SIG // 3PTFoTt3m0Za8ctBjPOyOyut0lh24pQ+v2NYnx7sLX0q
// SIG // DASWpO9VSxaNjoba4K61Zl92YjS0U+Nub5t9uhvgxYPD
// SIG // YliwlqG2XzFr+xzDCiVQ6YWbd3++7W3hEBdkIMTqiPL+
// SIG // roaC/ZIAk2Be2iUhlEtJTF6miVzb91Sr2MrjyRiEXd3b
// SIG // J3AxW5Z7PR4+9nAclaZvu2jeLjagJYQRod6MVcIkLcOw
// SIG // DA+chJEtZJmhABLIEkDFUy12sCsgMrDMYe9SKD9hagu0
// SIG // V7wkgOIa+JUT403nNuhuOI2jAzQaZMIaZ5M0DTS/4m0W
// SIG // XWahgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // XrbAv06t5o2sw7n+Jx8FStXjuHrwMo9fIKRy0h3F1zsC
// SIG // BmhLBSuI/BgTMjAyNTA3MDgwMTAxMTMuMjA4WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkRDMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAIDux5cADhsdMoAAQAAAgMwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjQ2WhcNMjYwNDIyMTk0MjQ2WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkRDMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAoZdDB+cAJzsfFIfEbYnRdCdMmhQxyWB06T70Udel
// SIG // 9SsRg2H0/D63BowiwomjrtytQ5lCFOEXOaJZ3Y2qaTbj
// SIG // oM8FKI+N1W2yceTxU2P2tWfNLaalT9DqCiZVJHwz0gSx
// SIG // YF1o+lYGskQiDbS7FGrMtMOYMrA+yCz2bokI2nHuSsQE
// SIG // oyn9jFV9anxM2AW0xjRIo0kAisMMnNHmr6+BaN1//rAr
// SIG // rgLZE1orLFOuJPKyutI7BkQKYhEnX7h69MlgJnO40zjz
// SIG // XhgMeigi9pLaZxnoCw3dSJROgbugUsACBR6+8zsCJRas
// SIG // kLgntEkACwmyYbE/cvYsutUSQF7FNLtEwuWGJk0mxCO4
// SIG // NdHWMfFI/r4fSJy6CmAuQ6Sm99dW2FXdG8rW85X00bJU
// SIG // UyYKLZ3wgCBjC6hKpPf9lURrvZJSYtY/Z1X6smB2KzDz
// SIG // gV3K0GFtI5ijYzi+OwmhAKzc4QwYmtcF3SQDSqjLyfKU
// SIG // HtpvP3Im8gzPtQVWarjQKL/TeLSReAArY19I41zQ1DLU
// SIG // maFRUB/hZFnXz1sdbgSJHPe0fsUS7j41MqR2eQNwAC0p
// SIG // HuE2kQb270wWMlth3pzk+52CykzuI8OUKunMN2fc0ykj
// SIG // 0Og+ZcomKXrOUUdjHTLyUuHwnDyRXmlTr7lhUkPxBrVQ
// SIG // UoYZiwfuXsMxc3aX9VLiZrjkE08CAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBSyKVlAfhHnkNvbFntFXc8VkBiSfTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAkBDG3rA+kwtPEdKGAnUguOdg
// SIG // EKxn/zvPRkOeArYBLG8c8Bg1VHJo1xXJ2iUkzXnQSlV5
// SIG // AYGsEaJz9S4MR+G881Y9nljZsxiMDtRZYZXQDzhwMywR
// SIG // B0aEmeKXXRbWkMaGm1Pzdb1siAojetCLfOYJxeSQ+DDF
// SIG // 8neqUvHgAyIuk7Y34Cj6LplmtARUP2hM41K3zzda+3Ky
// SIG // vqpJi87cPxDUu83pn8seJBkYMGNVgXxapv5xZSQz0AYn
// SIG // KnlN3TqfYY+1qg9EXPv+FWesEI3rCMgpL+boVDcti4TQ
// SIG // 4tpXmLQIiBaZo3zZOBp4C7wtk4/SKzjL9tEq8puSfxYe
// SIG // 8lgIj3hrN8gN0GqY2U7X6+zX86QSCUOMU/4nOFhlqoRp
// SIG // UZVQSObujo8N2cUmQi4N70QuCmMqZIfBXSFqCoq44nRB
// SIG // pV7DTqPlD/2BuSoXm4rnUwcRnnHyQrrlLKSHUYUrRwEL
// SIG // I7/3QKlgS5YaK6tjgmj/sBYRN1j4J58eaX5b5bo6HD4L
// SIG // DduPvnXR65dztRRWm1vJtFJAx0igofEE8E5GDsLvfYhM
// SIG // QVVpW2GUc9qjiAYy/6MxIbQgdGrioX0yy3rjRgVGgc/q
// SIG // GWfl/VABAqDIZBE42+mHzWiNU+71QGoroQaFfyQjkE/k
// SIG // WGa4MpMj6c6ZsDDRQQ9b3Vv9vavZ5E1qBIXBDjtC/Tcw
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
// SIG // TjpEQzAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAza8UV/4s+rLNZQQlxvD9SxcQ9HuggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOwWdwwwIhgPMjAyNTA3MDcxNjQw
// SIG // NDRaGA8yMDI1MDcwODE2NDA0NFowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA7BZ3DAIBADAHAgEAAgISlDAHAgEA
// SIG // AgISITAKAgUA7BfIjAIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQABKPWp206Z
// SIG // fQwIzraAhusLJvwPnWqeuzPtUjPqN4DlXmvTqUXlkunG
// SIG // iAM5NKtvbXT3HEkr8n4DnlahdDNI+D8Ogl/ZidkBwu+w
// SIG // sFjgjFFT7nyt9e+C1VODanjXKS5iaYz5tXtSO9GW9HnD
// SIG // V+wQL82D/ToRTsNS7Xz+sPDiV+hRGKVynJKle7fSgN1Z
// SIG // qYufXG8pML1PrI/eBZUQA87dZeJ3pFV+PjtVvUG/RXu2
// SIG // 8Qe4EDkQG90WqhVR2/WBIEdqPUuSDsXHXuVXK6Ubg5Mt
// SIG // odAI+tHq70IjhcHMeB/8DPVb5mBIR/697NhpZQwKtmjN
// SIG // pVCwxvKbR+E2Tn2N9lAyqUYyMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAID
// SIG // ux5cADhsdMoAAQAAAgMwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgdrE7Qr6cZCH+8EVzEJN/yRGhGiPt
// SIG // 00xaENOHZLRTgn4wgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBLA90bcZb2k8RTmWZ6UMNA5LD5lXbqOUsi
// SIG // vYfcPvoTLTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACA7seXAA4bHTKAAEAAAIDMCIE
// SIG // IA+r1qMY4NQWAp05ZYIxP2GY0+7QXGxYfXT2cTCek2sj
// SIG // MA0GCSqGSIb3DQEBCwUABIICAHIBQBiyGej7oXYV//gz
// SIG // V10dndgxtHOoLI1AWrYPP+ZhbcD/+WpLz6dIJ7ape6mS
// SIG // 4aKZmCbRWjTYBSAx+Eg5K0rv4ko0L5QktObaFKrrmC/Q
// SIG // v6RcCDP0tQEzsxfbtHpx3RsmCDDEiAiSEJtapKcT3NvZ
// SIG // qNAGM+QTsIizpAvHY4gdT+jD+xCbZbB3AEWDyyLfZRnv
// SIG // pMGsQQvaqj1OvDqx8VgGxNnNkOS9TWN/Hjn4RFN3X43f
// SIG // 34LvhlZitYJhBrDlq69kfoXnB/+3zttjSnc/fwOcJgls
// SIG // lVUhxbD6320FpYMypF3Yxmr1Sjiu6xoseQwzRwG0l2En
// SIG // 4uAcmiGbU8TWdrH4BCBBkuFaYDgtfgfIlxi8QPhZDkGL
// SIG // vBYgyilURBMzRxotIMim/QJ6Xs5+5k2ubpD9ZoF3CJTi
// SIG // G0SfVVe9iS+wQoyqf60AF8QXgjrxds7OkYUc0AYQgmlj
// SIG // Hea5mEuMH55Jz/Hs1TH1I5KW+w9swJGUz0PTQl//De+7
// SIG // WWhD4XCRSDRr0E9gJWv44YkH/KAlQl14Xc4NZTrZ9uDj
// SIG // JjbxcxxzGgCNt7mxZG9YOQeOFzAmO14ryt2C5IgutHcy
// SIG // fA1AmAwqCvFMvRplorx3+togg7vWfLyyi9HLZdJtGJ8g
// SIG // GNXR0IB2N/fvlAW/UPCLtaLNFjqJRHnl4MBqQY0ots4y
// SIG // O8Bl
// SIG // End signature block
