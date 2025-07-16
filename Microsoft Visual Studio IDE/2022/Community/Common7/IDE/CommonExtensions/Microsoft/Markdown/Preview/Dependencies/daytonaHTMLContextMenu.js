const plugin = require("plugin-vs-v2");

let SaveAPI = null;

var menuItems = new Array();
var htmlContextMenu;
var copyLabel;
var saveLabel;
var printLabel;

const copyCommand = () => {

    const selectedText = window.getSelection().toString();

    navigator.clipboard.writeText(selectedText).then(() => {
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
};

const saveCommand = () => {
    SaveAPI ??= plugin.JSONMarshaler.attachToMarshaledObject("SaveObject", {
        save: function (html) {
            return this._call("SaveHtmlContent", html);
        }

    }, true);

    var htmlContent = document.querySelector("html").innerHTML;
    SaveAPI.save(htmlContent);
};

const printCommand = () => {
    window.print();
};

// Uncomment access key and event listener when the Daytona Key down event can handle 2 keys being pressed
// Will verify that pressing the keys trigger the commands
// Bug 2175234 needs to be resolved first

/* document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key == "p") {
        printCommand();
    }

    if (event.ctrlKey && event.key == "s") {
        saveCommand();
    }

    if (event.ctrlKey && event.key == "c") {
        copyCommand();
    }
}); */

const createMenuItems = () => {
    return [
        {
            id: "Copy",
            callback: copyCommand,
            label: copyLabel,
            type: plugin.ContextMenu.MenuItemType.command,
            //accessKey: "Ctrl+C",
        },
        {
            id: "Save",
            callback: saveCommand,
            label: saveLabel,
            type: plugin.ContextMenu.MenuItemType.command,
            // accessKey: "Ctrl+S",
        },
        {
            id: "Print",
            callback: printCommand,
            label: printLabel,
            type: plugin.ContextMenu.MenuItemType.command,
            // accessKey: "Ctrl+P",
        }
    ];
};

plugin.Messaging.addEventListener("pluginready", function () {
    copyLabel = plugin.Resources.getString("CopyMenuItem");
    saveLabel = plugin.Resources.getString("SaveAsHTMLMenuItem");
    printLabel = plugin.Resources.getString("PrintHTMLMenuItem");

    menuItems = createMenuItems();

    htmlContextMenu = plugin.ContextMenu.create(menuItems, null, null, null, null);
    htmlContextMenu.attach(document.getElementById("___markdown-content___"));
    return htmlContextMenu;
});
// SIG // Begin signature block
// SIG // MIIoTAYJKoZIhvcNAQcCoIIoPTCCKDkCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // mowwAMySSdxfMYSOGR94Pd1yVkNOHNv4PkNqk6o7ttKg
// SIG // gg2aMIIGGDCCBACgAwIBAgITMwAABGywBiTSkpxv4AAA
// SIG // AAAEbDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI1MDUxNTE4NDgzMFoX
// SIG // DTI2MDcwNzE4NDgzMFowgYgxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xMjAwBgNVBAMTKU1pY3Jvc29mdCAzcmQgUGFydHkg
// SIG // QXBwbGljYXRpb24gQ29tcG9uZW50MIIBIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs+9MS5Goe/WeR16w
// SIG // 5NSBRx5Lne49ZGXn3HhHUJ0dFFlOVpS9kYQn7YouBMdc
// SIG // UCwYeWNupzlWFUlH1iCzcIwmqvjdLe1d/KpOYX0NB+K7
// SIG // pWgZIM5INH7KfPYlwod2DzBFHte4iWZRkhdIrNej2mde
// SIG // cJYcX+Hl6OnzubfpNYQKdnb4wUBFIUGUI6V/edLvJJO3
// SIG // P2k3OLlPkv84lsyr7HadvKiMhXtkPH2esp7ADR715az4
// SIG // ye6tdoHEyqILYEiVMntyErsDo2wbDL+Yn1zDzA6szDSR
// SIG // imNWd4miLyUin8siZHSZF27y0DC4LMrU6FJJYJNpPpAB
// SIG // rA3Pn1Ty1GD19Np7EQIDAQABo4IBgjCCAX4wHwYDVR0l
// SIG // BBgwFgYKKwYBBAGCN0wRAQYIKwYBBQUHAwMwHQYDVR0O
// SIG // BBYEFPkx6YWQRVQs9eCr8IK93v7NaTNYMFQGA1UdEQRN
// SIG // MEukSTBHMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFu
// SIG // ZCBPcGVyYXRpb25zIExpbWl0ZWQxFjAUBgNVBAUTDTIz
// SIG // MTUyMis1MDUxMjMwHwYDVR0jBBgwFoAUSG5k5VAF04Kq
// SIG // Fzc3IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0
// SIG // cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwv
// SIG // TWljQ29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBh
// SIG // BggrBgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljQ29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAM
// SIG // BgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCe
// SIG // 6lZAnFogAmP15jdV3OgW4ZV9f7CzsTdc1P+nyFwkgbg2
// SIG // UkTckZy/KFKtxLDFv+W2Gom5Cj/34IHWKVEvBEPjzFAw
// SIG // 0XwFTzkfHs/2M1SrFnWHOj2wbBoLkjkDEeHOYX3VzJSI
// SIG // ZTP4VCt5mDTuEwU4x5F/N0N1csUJZ8Mbxq7yEkH9TGDq
// SIG // BrxA6tGHjScIoJfACKXJhmo2ywDfhSY32QVuvm5cwoGM
// SIG // k82WnW9xe6FqRN+6Yp0bEsLhNdfK4pjqotqWxxnUMAax
// SIG // Vj+5xq5HeWWcv86g1IN7ys6hFmIyliHvg9TohjSjkoyJ
// SIG // w4tfe+bZAyXAWXHl+HBHcXy/a0DVouuPuSdHpG7D6WXM
// SIG // dZPS4Zw0Amsypw+8D7CNwVZoFjy/ywv6jn+Onl2jTT06
// SIG // 05OVGWq2ZHHpTvCAg/f+8qLF60msfSeTrZfMtH8QZQfI
// SIG // 1bkkYcQaMg6LPP86Y4nu8UVJxdKYF0fqmoe3Ob1xfmMl
// SIG // VULJo8Qvv4f1LIKtQyVYMElDwomSfoGs3ogumCKqjSi7
// SIG // kWWE2iOn9z5rML07apN6u8OzOhBPoLZqtkmg6pC31jXI
// SIG // VhdmeDV4fOOSDmosQWpo/yilf/fCsZiTvlgKi+ttcfXS
// SIG // +CKvtik9jPBOb3x2hwkTq435DK35nQBLKtrUjY1aO8nd
// SIG // +iEm37K48IVeDlTWuu8RwjCCB3owggVioAMCAQICCmEO
// SIG // kNIAAAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4X
// SIG // DTExMDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9z
// SIG // b2Z0IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJ
// SIG // KoZIhvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t
// SIG // 2G6qghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7d
// SIG // N2vGEtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55J
// SIG // nOloXtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJS
// SIG // JhIv56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64Dhk
// SIG // rG5kNXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ9
// SIG // 7/vjK1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+
// SIG // sYxd6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4
// SIG // ftKdgCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf
// SIG // 8NBSv4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOn
// SIG // qWbsYR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj
// SIG // 43BdD1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8
// SIG // GLhEfEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO
// SIG // 3+xbn6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4
// SIG // X7IvhNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXU
// SIG // pUMvdJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxG
// SIG // oGyY0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3
// SIG // FQEEAwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVt
// SIG // qMp1ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEw
// SIG // CwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYD
// SIG // VR0jBBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYD
// SIG // VR0fBFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2Vy
// SIG // QXV0MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcB
// SIG // AQRSMFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGU
// SIG // MIGRBgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9j
// SIG // cy9wcmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIg
// SIG // HQBMAGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABh
// SIG // AHQAZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOC
// SIG // AgEAZ/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQ
// SIG // wWVfLiw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZdd
// SIG // ZYSQfYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9
// SIG // G6XUtR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKK
// SIG // ELukqQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP
// SIG // 80Yr3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ
// SIG // 1h/DMhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgy
// SIG // cScaf7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6C
// SIG // PxNNZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2
// SIG // l4bf2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1
// SIG // HxS+YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9
// SIG // WfOXpQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpI
// SIG // lR+r+0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h1
// SIG // 5q/6/IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BX
// SIG // IqF4ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3Zb
// SIG // CoBIa/15n8G9bW1qyVJzEw16UM0xghoKMIIaBgIBATCB
// SIG // lTB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9N
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMz
// SIG // AAAEbLAGJNKSnG/gAAAAAARsMA0GCWCGSAFlAwQCAQUA
// SIG // oIGuMBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwG
// SIG // CisGAQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqG
// SIG // SIb3DQEJBDEiBCAXiuopEka7Pe6uSAcUQzG8qaT0c7sl
// SIG // z7LsZCfmAIywLzBCBgorBgEEAYI3AgEMMTQwMqAUgBIA
// SIG // TQBpAGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAKH5
// SIG // bB+BUnhBgb4hh/DPERV28uotfBWBq8TpOu6zmOvzPGNW
// SIG // Vo+BmgyHlGuDWcS0qPgJbR31aoDcGfXw+Ig3bWl5IP85
// SIG // MqMwNedf+sBOsn3pmANCn3bPvlU6EpuWSptOVWNty7M+
// SIG // T288XDbYmkmgRMlGQXAPnvcfZ/J3GHJoLFPE3iaaYwSt
// SIG // 1UwCEqcK2HOSe1eqDLZQRxiz/67PewdnvRFg4czh8sQi
// SIG // n2zuw720kWtaUzDGKUc+ZRHbfM8nkfQZKiCkgHvSqaj2
// SIG // dVPdboEGaBhlOXXj8bx7nITLaqZWGngltiVktxsX062p
// SIG // 0XEq6FPTjGpXT03JQNV/cpXNIkPhfc6hgheUMIIXkAYK
// SIG // KwYBBAGCNwMDATGCF4Awghd8BgkqhkiG9w0BBwKgghdt
// SIG // MIIXaQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZI
// SIG // hvcNAQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkK
// SIG // AwEwMTANBglghkgBZQMEAgEFAAQgEgSnJS/dIXxMZlGD
// SIG // iaud3Fb0uGMasDQiNwtk+3D/Fl0CBmhLHiaq+hgTMjAy
// SIG // NTA3MDkyMzQ2NTkuMDA0WjAEgAIB9KCB0aSBzjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjg5MDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIR6jCCByAwggUIoAMCAQICEzMAAAIOLMsofZUg
// SIG // dWMAAQAAAg4wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjUwMTMwMTk0MzAz
// SIG // WhcNMjYwNDIyMTk0MzAzWjCByzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2Eg
// SIG // T3BlcmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1Mg
// SIG // RVNOOjg5MDAtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArObe4kbV7dIW
// SIG // 3qPTBO/GWIyKN7GkLljARUO1+LPb6KGEQAUzn9qaEx2r
// SIG // cfhMJwVBgdVdrfxOjMLEDZmOV6TP++Wgq2XcQJ61faOE
// SIG // 7ubAXqW233obKzlkQSBqCROj7VqHdQqxXoZtXYs942Nx
// SIG // /Iha4e56nn54mdUp23FjzMjSMbhhc6UIgwPhOWEt95nj
// SIG // Kml8IXW9NQpbspof9xCr5J4+HSKUGRFjjzN48W0VQGDe
// SIG // SdrTq2JCXHQ8dJdNlfzWHdapL1AYD8ayr4quZM+xOgGz
// SIG // onwg0jAYHJ/1+0UMOt9EJM6oadJA1Nqnov2qPSB5rrkX
// SIG // lxI546YE7K+AG99yAgCjGMTkHvp+cKhFXBPTk8oZlmSU
// SIG // uQJ1lE54qJOJoMDjQVkNQyzhhZGcF099+CDwqneP9/y3
// SIG // fyLYs4rLclGWLJpfwuGYXQC2732MM799TsX/DU5leSBs
// SIG // VnR55Nh4YeG580yqLBGg6yb0DIkPpaKIzO3+W4HcgQZ2
// SIG // EAZufv4ibMcPJNtu8xdo2zSPjsLPBy3mRrfLeridnlYz
// SIG // Q9QdGLYLAT9HLAZZ5yPuPnby2EbdHAKsOj4mEs+RUmXG
// SIG // 6YtMXQB/43d3c8hgK28i7qOvR7oHxhBG/7DNO63KD9aN
// SIG // 3GfHljG+PjCAfHrjm+Q1Tw5xHBYuDQ7pGDPdYNQ7f6iH
// SIG // pPq7RPPFUvECAwEAAaOCAUkwggFFMB0GA1UdDgQWBBSF
// SIG // cURpUhGRPtREiulBiO2DXBCI2zAfBgNVHSMEGDAWgBSf
// SIG // pxVdAF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSg
// SIG // UqBQhk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBe
// SIG // MFwGCCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29m
// SIG // dC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNV
// SIG // HRMBAf8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMI
// SIG // MA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOC
// SIG // AgEAdeC9ky/i/Dly8Zxkmpdod9JmexbARaKImJFFTmNO
// SIG // RfaZ8D01bnxAxlhKTTctjn2lB1iDqEP/f648DtIUtkqQ
// SIG // dAczAJNoMs/djRljqVm6QXTL660Q6YlmYv7i0uGRnUZ9
// SIG // z9g3HGJpZDT/r2kQF757/pqduyoCO/ZifYRsgkG77TCI
// SIG // 5G2KC6iu7Be1moZ/ay419cuUCS+JbxMt0JgPSkQY+enB
// SIG // L/5QL8w6u3koqkav6QsqsnPLs5kPEnilslrug41APb4v
// SIG // OELJi46jxgpx+HD8oPrfeUaVvu97J4XsNYglfsF7tkcT
// SIG // J1oOxLA+Xi5CRy7M1CD3flwpQ/hU71dNxn6ww35PuOX5
// SIG // R/3ikWXNzFGbZ4SyYz8L9yqCg0nFuIlekmwkcnGD5KqF
// SIG // gax3+0rwwOxqx9lDrc9VmtZNu7HWYKRuv3PQqiiPAl+b
// SIG // 4GmvgO6GB2+GQY+0vLvLIMcFiux4Fg0Qcjh9woibuCyf
// SIG // Id04kZEQK5h0adJWzX9YgCri/POiChPddr9MquebfIzM
// SIG // YwVO7qC7K2FSKCpM4frAJIJKRjqGS9ePnZcVTPdQWr82
// SIG // uJDg01JcM2/kqV7EqlcfJ7geqoVMu6aqYMMNauEjYQMR
// SIG // ZxcbMYk5WqC++RjcT0etOZSdll3obRIu//mHyarx/r56
// SIG // nKago8kPYTWlc7jhB1+DMrqnI8IwggdxMIIFWaADAgEC
// SIG // AhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEB
// SIG // CwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQD
// SIG // EylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRo
// SIG // b3JpdHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5
// SIG // MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEA5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51
// SIG // yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64
// SIG // NmeFRiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1
// SIG // hlDcwUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmv
// SIG // Haus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoP
// SIG // z130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1w
// SIG // jjHINSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56
// SIG // KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7
// SIG // vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2l
// SIG // IH1+/NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUD
// SIG // o9Fzpk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhz
// SIG // PUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtco
// SIG // dgLiMxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGU
// SIG // lNi5UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsl
// SIG // uq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W2
// SIG // 9R6HXtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZ
// SIG // MBIGCSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUC
// SIG // BBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQW
// SIG // BBSfpxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBT
// SIG // MFEGDCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNo
// SIG // dHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0Rv
// SIG // Y3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYB
// SIG // BQUHAwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEw
// SIG // CwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYD
// SIG // VR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYD
// SIG // VR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2Vy
// SIG // QXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4w
// SIG // TDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAx
// SIG // MC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1V
// SIG // ffwqreEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9
// SIG // MTO1OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulm
// SIG // ZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pv
// SIG // vinLbtg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbz
// SIG // aN9l9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3
// SIG // +SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsId
// SIG // w2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5m
// SIG // O0+7hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ
// SIG // /gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9
// SIG // swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu
// SIG // +yFUa2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyh
// SIG // YWxz/gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFR
// SIG // hLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0
// SIG // +CQ1ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAx
// SIG // M328y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQ
// SIG // wXEGahC0HVUzWLOhcGbyoYIDTTCCAjUCAQEwgfmhgdGk
// SIG // gc4wgcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsT
// SIG // HE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAl
// SIG // BgNVBAsTHm5TaGllbGQgVFNTIEVTTjo4OTAwLTA1RTAt
// SIG // RDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUASuh2P2Vi
// SIG // 5znDBELI5AwKAfyWVgiggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIF
// SIG // AOwZMtAwIhgPMjAyNTA3MDkxODI2MjRaGA8yMDI1MDcx
// SIG // MDE4MjYyNFowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 7Bky0AIBADAHAgEAAgISwTAHAgEAAgITDTAKAgUA7BqE
// SIG // UAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQCDHCCHrHJU3JGfZ71tEQ6FNdbn
// SIG // 9BT8z6t1RzFac1dYEesnGZ38GHKvIS4PDmu4zg5vLVLd
// SIG // xNEOajIn5p9dJ1R4ZThWeBCqQK2gHl96Qdqej5K3Snh1
// SIG // Yz320zw71tHYe41rn32CgRDqrypVfSzuJpciGxOdxvWR
// SIG // ed7edvAAaTwzby4McNJpxjCEjS51zi+7M8ImOlpphdjE
// SIG // RBqnL4InNcB6gqGArQSxrIAxPY3G97w9KfbT9cOmYvm+
// SIG // JEtDIZkr9amWIuWhKEZyWDycvf9cX4cHSALYtQ0ksaLv
// SIG // JqvXwRfezmwTiPaPgNlP6554cmfmSOShJZ04Vl+6xsbW
// SIG // QG/187LSMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAIOLMsofZUgdWMAAQAA
// SIG // Ag4wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // yDE3Y+mRIuK1XVsLP2gMwOPXbrWfAOQHWhnF/ZfS1LYw
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCABdB1z
// SIG // JfDpgZCtuu5saGykoocDnT9HlDV0DMqT808ShjCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAACDizLKH2VIHVjAAEAAAIOMCIEIEZfTc/TffdkVhH2
// SIG // T0eW07EVfoUwToXYEg7QIK28PGucMA0GCSqGSIb3DQEB
// SIG // CwUABIICAD1w7p11FRj/3VmlkMIF4vgtIs4RRrTxBcoj
// SIG // kBDZhLOBYrH13pByVKuEdC6Ou8tnfWUZSlnSbKLmBk4J
// SIG // AleCNyhtNaCnhPSHhmikEn9UN4EzvNaLbkoAC7gc2Glc
// SIG // Pu4Vxqy00xbsWFRmZsuEoKGP6nK+Tj3QCq1BkLTmEBKS
// SIG // ztGjgSXCHqJVNdeEw09iM81i86+ENjVefn7CCvJ8DlZP
// SIG // kIPQW8fmoh7aghMRaq7BoecHp7qZUQD9wCZxvxl2VcNq
// SIG // gjJYggnivly4YnStyKPKQE7VBhIPhF/IPIqh0EAYDvdM
// SIG // MfjeRW84rmlMAojpBo60Bjbax/6947+Sqo+2FQ6nAXWF
// SIG // 0j53ysUn0VuXQ98aBlX/QQwGBSOFIWrxwoYTXdN/ka0/
// SIG // QJxlMakqUfjjc4xSgrDuKwbIGYAYYZ/eAavEdN5uwuOk
// SIG // wlzmV430wYfjvztpgAxFtdU4HmvPIw8QqDZzfBLQIK2C
// SIG // GLH6LIViO29Vb64RpO+FmngKkbJ/hhHpJDGoXbOxquSA
// SIG // mknwQ94TsQjn3jY4jPBV5NZXuiCX9ClgVhtQOz3rrlfT
// SIG // KqK4gy5TkwgTIS6uJC8Q32SSdt1dK4cBka/8uzn51Cpd
// SIG // zHtG6Kxddq53haLf9i+uKYdTXUCwa3X751qI6Vo79Fos
// SIG // AGi87Eet6e6fPBQJikFB9bwR2aPQ0QW/
// SIG // End signature block
