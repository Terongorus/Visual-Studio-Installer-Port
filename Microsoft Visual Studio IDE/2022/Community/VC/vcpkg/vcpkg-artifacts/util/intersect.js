"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersect = void 0;
/**
 * Creates an intersection object from two source objects.
 *
 * Typescript nicely supports defining intersection types (ie, Foo & Bar )
 * But if you have two seperate *instances*, and you want to use them as the implementation
 * of that intersection, the language doesn't solve that for you.
 *
 * This function creates a strongly typed proxy type around the two objects,
 * and returns members for the intersection of them.
 *
 * This works well for properties and member functions the same.
 *
 * Members in the primary object will take precedence over members in the secondary object if names conflict.
 *
 * This can also be used to "add" arbitrary members to an existing type (without mutating the original object)
 *
 * @example
 * const combined = intersect( new Foo(), { test: () => { console.debug('testing'); } });
 * combined.test(); // writes out 'testing' to console
 *
 * @param primary primary object - members from this will have precedence.
 * @param secondary secondary object - members from this will be used if primary does not have a member
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function intersect(primary, secondary, filters = ['constructor']) {
    // eslint-disable-next-line keyword-spacing
    return new Proxy({ primary, secondary }, {
        // member get proxy handler
        get(target, property, receiver) {
            // check for properties on the objects first
            const propertyName = property.toString();
            // provide custom JON impl.
            if (propertyName === 'toJSON') {
                return () => {
                    const allKeys = this.ownKeys();
                    const o = {};
                    for (const i of allKeys) {
                        const v = this.get(target, i);
                        if (typeof v !== 'function') {
                            o[i] = v;
                        }
                    }
                    return o;
                };
            }
            const pv = target.primary[property];
            const sv = target.secondary[property];
            if (pv !== undefined) {
                if (typeof pv === 'function') {
                    return pv.bind(primary);
                }
                return pv;
            }
            if (sv !== undefined) {
                if (typeof sv === 'function') {
                    return sv.bind(secondary);
                }
                return sv;
            }
            return undefined;
        },
        // member set proxy handler
        set(target, property, value) {
            const propertyName = property.toString();
            if (Object.getOwnPropertyNames(target.primary).indexOf(propertyName) > -1) {
                return target.primary[property] = value;
            }
            if (Object.getOwnPropertyNames(target.secondary).indexOf(propertyName) > -1) {
                return target.secondary[property] = value;
            }
            return undefined;
        },
        ownKeys(target) {
            return [...new Set([
                    ...Object.getOwnPropertyNames(Object.getPrototypeOf(primary)),
                    ...Object.getOwnPropertyNames(primary),
                    ...Object.getOwnPropertyNames(Object.getPrototypeOf(secondary)),
                    ...Object.getOwnPropertyNames(secondary)
                ].filter(each => filters.indexOf(each) === -1))];
        }
    });
}
exports.intersect = intersect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJzZWN0LmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbInV0aWwvaW50ZXJzZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCx3REFBd0Q7QUFDeEQsU0FBZ0IsU0FBUyxDQUFzQyxPQUFVLEVBQUUsU0FBYSxFQUFFLE9BQU8sR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUNqSCwyQ0FBMkM7SUFDM0MsT0FBb0IsSUFBSSxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQU87UUFDekQsMkJBQTJCO1FBQzNCLEdBQUcsQ0FBQyxNQUFxQyxFQUFFLFFBQXlCLEVBQUUsUUFBYTtZQUNqRiw0Q0FBNEM7WUFDNUMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLDJCQUEyQjtZQUMzQixJQUFJLFlBQVksS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLE9BQU8sR0FBRyxFQUFFO29CQUNWLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDL0IsTUFBTSxDQUFDLEdBQVEsRUFBRSxDQUFDO29CQUNsQixLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTt3QkFDdkIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLElBQUksT0FBTyxDQUFDLEtBQUssVUFBVSxFQUFFOzRCQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUNWO3FCQUNGO29CQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQzthQUNIO1lBRUQsTUFBTSxFQUFFLEdBQVMsTUFBTSxDQUFDLE9BQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLEVBQUUsR0FBUyxNQUFNLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTdDLElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRTtnQkFDcEIsSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLEVBQUU7b0JBQzVCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUVELElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRTtnQkFDcEIsSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLEVBQUU7b0JBQzVCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDM0I7Z0JBQ0QsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsR0FBRyxDQUFDLE1BQXFDLEVBQUUsUUFBeUIsRUFBRSxLQUFVO1lBQzlFLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV6QyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSxPQUFhLE1BQU0sQ0FBQyxPQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQ2hEO1lBQ0QsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDM0UsT0FBYSxNQUFNLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNsRDtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxPQUFPLENBQUMsTUFBcUM7WUFDM0MsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7b0JBQ2pCLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdELEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztvQkFDdEMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDL0QsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDO2lCQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBRUYsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWhFRCw4QkFnRUMifQ==
// SIG // Begin signature block
// SIG // MIIoOgYJKoZIhvcNAQcCoIIoKzCCKCcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // MhZAJiEyWZ4cbym6Zkikm9fPV6MC6L/hu7v2kOSKqIag
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBPyM4wZ1pfi6E7
// SIG // x6u7id/AuAW7kUCxFgYQ4Jy31ygYDTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAAKcw4DfymFInWSrqOwc//gx93xR2v57
// SIG // mHu5r8BGestji/A3mde9atCeS2Di7niW+GnKjQzSkzAf
// SIG // D51EzDDibXVuQ1BX0Cj5NoaJMrs83lHQKAbzvlorZIVs
// SIG // YRlDLkZ8s8ZgXkWRjo5eMImMUYSB8oqsyiic9eJ0773R
// SIG // hFwJgyeAchiC7siMNB0DfJ/FnSn0xDXrZ0Betr0Ha3cP
// SIG // zeExqJBond1lQCMWjN7BKWVz4DQ2mN9f5H4+zh3sAxVf
// SIG // R+i98xm7vx1/uT0/GSq7ZtudVmW5svb6X/Qz5W6YIP6a
// SIG // bJFC31k69cZodMrB2v8VVDJA7UMDMb43ASom6I86fzu3
// SIG // ajOhgheXMIIXkwYKKwYBBAGCNwMDATGCF4Mwghd/Bgkq
// SIG // hkiG9w0BBwKgghdwMIIXbAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // ohuH9mVlKsbyqvDbUtoFQof7inhQFPMuYCBGnJTqJOYC
// SIG // BmffBSeaAxgTMjAyNTA0MDExOTU5MzAuNjQ3WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkEwMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR7TCCByAwggUIoAMCAQIC
// SIG // EzMAAAIIeJ1YXZLH2VIAAQAAAggwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjUzWhcNMjYwNDIyMTk0MjUzWjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkEwMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAtctwCOZSM9yKdZyuQTFFGxkbI0pws/1RrN9872ND
// SIG // XrIbD4H5Xd/2d/93UvFigS5Q5aLJlyTmZRUojV1Heg0y
// SIG // cQPYpP2WwnVie/Cyo2zd7RZF9nOkUaUTKQPLKv6AW0a8
// SIG // j93PEP4MaSQChx8/HLkp+3sHwi85zZsapYk5N0OSx6s9
// SIG // j43mCg/3WyjAU9kwAFgL7puM/x1yCerRXRqDVeFlEWbM
// SIG // AkrekTsGqkNaAGBrxJ3R/g12atfmx7IL3DzQnU0iKVqG
// SIG // 0IiUv1Ci4kdNijQqgeCPcmoxU0pZzCBDM/zYud/KBiOu
// SIG // KYXLzaVHtvqmilh2fHeE9SoIb0ZkkheGBeQzRCW8WglM
// SIG // LMu51C5rBZ02jo1TqExVln1l7wbjipAXEClhir65Ive+
// SIG // o+MfuXswD9+n6t7unR0SUy2QLuHRLjqKFN/pDGa/kQWF
// SIG // o0x0AilfsmdUk9HhpGx16ANpcskQ5TYwUHKHmSMVgmbb
// SIG // P3d/p39Y4kizen+sHR2lM9AA8Dk0P2hKNSAvOXhXj78i
// SIG // CmsRSZBlNjKmul86t6gqubaJCB7Y4aILKxIHwyk3hV07
// SIG // XYZdSD7S3AnzHFjhhgF6LFVFOxvePBelveuNuH9lRw/C
// SIG // 9xaMgCPfq+M8iEFJqohEs7kFnlqU04xWMApoF2hjrkg1
// SIG // fHDTlUAeiD8z53mYVU48MWwGZWkCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBSjMeL3zqnFE4GDlQfX9fP5oXoBTTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAUbMyiSsAH7MKnWkDxYmmAf2T
// SIG // QGFg2tONF03ELAmgrmuZ7BtSLJWGkqR+5oky6+nkBKl3
// SIG // M2aKnjmv8bw5zBonxjXWtAh20MLaZyIbLrayjto4YxGh
// SIG // sJSYDjKpdta+yJOl5wc2tHt4QTruFAZDJfyxF/gFEbe4
// SIG // u/kUzbBjdHFz8D0m0xRPvc+1moBm2PacFKPzcZBibHqh
// SIG // gkP/StlTFO+G8OXu/vCBlITNsbKST6p0nhz4WJnAdFnJ
// SIG // TsXFSH4/2bkL8KKz20xBGA1Qs0jd+3NMgoTzGOxSfhxh
// SIG // QTSccHeZSiK+xmH6vGtIDogtpYxmJXOK7eHAnndVyoPN
// SIG // 39JfWlFYplgWF7XzXm4aX6+i3N4w/DYLKw4c7dFoJyHZ
// SIG // 02Qou48Y7CAYpR/faWOf4em0HCyivxOigj/RNWDe/Hy2
// SIG // jl5FzMjusS670GfrgkotYXU7nxQu6EgfwlOUW3yFR1xt
// SIG // I9aNp9bZ3uHgmzXyqlD0xN9bTW1gUdt2IstK95EJh3mB
// SIG // NRi2y+KcJJ6moqdQUZ+liFDCbYJ3GsBDd93/AGBmeGtz
// SIG // Zx6KcxlVep3n3xlWoOE3bsvqMtWBfrIQoaF3TKn4T1ha
// SIG // R3t7iRk+BiRIjbOPtvGv8B1LhfmkWkdHDeT+15TsFNd+
// SIG // tIlAibUHbykGjQMBiNvSjsEt0Bq4kfRdozhj1AJaXhMw
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
// SIG // TjpBMDAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAjZL7tDSnEo3WCsq4SWXLMlzlEzSggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWsdYwIhgPMjAyNTA0MDExODQx
// SIG // MjZaGA8yMDI1MDQwMjE4NDEyNlowdzA9BgorBgEEAYRZ
// SIG // CgQBMS8wLTAKAgUA65ax1gIBADAKAgEAAgIP7AIB/zAH
// SIG // AgEAAgITCDAKAgUA65gDVgIBADA2BgorBgEEAYRZCgQC
// SIG // MSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQow
// SIG // CAIBAAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQA8X3g0
// SIG // 7jRYhVk8jdFKrdQ29UNP29Nhj+JAcxCzkBPIe6UgdoWs
// SIG // kBgeJUMsX/qfr1U2VOWjfkRDE8sBXIX6HAPH4uu0n78v
// SIG // m3FWYvlCyh2uzBwhZAs+iZ4nzsCD37qIr34odxRyfAU+
// SIG // 5Gcpe9jgtlfL0n0MnzE9G8dMsPN4zRv3xt7HMw5Qt2SQ
// SIG // fY+ChOResyhiDG+UuRidRi8/TDMG3/OqxEyT0PGf13yb
// SIG // JHDFeuh183cbRl2CcS6yGyU5fFSE2eVeLs7wOF1nXW5p
// SIG // KU1my9XhBMUF1t1xCFrspv5sAfNon+LEOl1NV/efptdR
// SIG // tPOGtxxdWi28/dfXciIHF+hfWaEAMYIEDTCCBAkCAQEw
// SIG // gZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAIIeJ1YXZLH2VIAAQAAAggwDQYJYIZIAWUDBAIBBQCg
// SIG // ggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAv
// SIG // BgkqhkiG9w0BCQQxIgQg86gs9YYmpSn5ipobQ8BYCNRT
// SIG // vFB+mofXm47hJkN+POwwgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCCP/45vCR2tltTve+/LffhbdmeTZiqr
// SIG // bT5OkPvUUaZnqTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAACCHidWF2Sx9lSAAEAAAII
// SIG // MCIEIDk0zqBVB+5oKjYNkxIZkibjszR/jMDuXPamq5Ao
// SIG // HLpWMA0GCSqGSIb3DQEBCwUABIICAEQPrEl7TBwURVyP
// SIG // Im59HJMRiwEnQ8YUNNac/VNwNH/EPvDY21iczvuQRY3Q
// SIG // rkP6uOk0mz7Uer2kxY61UJ6oJYBuWd3ct6+GwrbH5Gps
// SIG // 5oQJS9mjDEoILfIQC6hWdvjHEyN6DSLRIp9o6DdgK8pP
// SIG // AEkTIWKcdOgDwWxbkmr7nmHfdhklBN8pQF6a1Gtiuj1y
// SIG // nDCLR4+r1vMhLfgA8PshYkyeS1AvzPP8DrSIzEtHUAGc
// SIG // SgktT1ni3DCBwwVTV2ajcjA9WNV1+RTAAzhM3n6fF6dz
// SIG // GT+C2bmffRhCmSsMZ2juP6SYAYg4boO/FX9GuZ5QDc8I
// SIG // +3O+xJQBTF1ipO46D+Ppr7QEr6ugvYdtJH4gAYBRcrsx
// SIG // v8bYG+RaxcXEwUuczG7Kh1LGj+GqL4wf3WXIG/niEqqw
// SIG // NblWefpFnBsL+XijalPfszjWxwvGfroTtjaXGEJ+OESZ
// SIG // EkLCDECJ85pVNZmxuCbpL4cY82yxUOt8qBxZ1dXgSwWm
// SIG // 9MDXSyQ9TEgXUG7eg6X17meKLiZUovX238KvRxK5wqwS
// SIG // +0AumRh/lv8RYjAD4j9+DSY0tB3v56ieOdj1ReN5iavs
// SIG // SryEVsrcqDJOVNAXdl4BcObmb8U+ofRdDPHWi2z6lnib
// SIG // gaJKdd7lYobpgqn/geFKXpiinEane49B4GcG136+C96U
// SIG // 483vVLO0
// SIG // End signature block
