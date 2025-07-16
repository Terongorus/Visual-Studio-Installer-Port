"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeWhitespace = exports.parseQuery = void 0;
const i18n_1 = require("../i18n");
const scanner_1 = require("./scanner");
function parseQuery(text) {
    const cursor = new scanner_1.Scanner(text);
    return QueryList.parse(cursor);
}
exports.parseQuery = parseQuery;
function takeWhitespace(cursor) {
    while (!cursor.eof && isWhiteSpace(cursor)) {
        cursor.take();
    }
}
exports.takeWhitespace = takeWhitespace;
function isWhiteSpace(cursor) {
    return cursor.kind === scanner_1.Kind.Whitespace;
}
class QueryList {
    queries = new Array();
    get isValid() {
        return !this.error;
    }
    error;
    constructor() {
        //
    }
    get length() {
        return this.queries.length;
    }
    static parse(cursor) {
        const result = new QueryList();
        try {
            cursor.scan(); // start the scanner
            for (const statement of QueryList.parseQuery(cursor)) {
                result.queries.push(statement);
            }
        }
        catch (error) {
            result.error = error;
        }
        return result;
    }
    static *parseQuery(cursor) {
        takeWhitespace(cursor);
        if (cursor.eof) {
            return;
        }
        yield Query.parse(cursor);
        takeWhitespace(cursor);
        if (cursor.eof) {
            return;
        }
        switch (cursor.kind) {
            case scanner_1.Kind.Comma:
                cursor.take();
                return yield* QueryList.parseQuery(cursor);
            case scanner_1.Kind.EndOfFile:
                return;
        }
        throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected comma, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
    }
    get features() {
        const result = new Set();
        for (const query of this.queries) {
            for (const expression of query.expressions) {
                if (expression.feature) {
                    result.add(expression.feature);
                }
            }
        }
        return result;
    }
    match(properties) {
        if (this.isValid) {
            queries: for (const query of this.queries) {
                for (const { feature, constant, not } of query.expressions) {
                    // get the value from the context
                    const contextValue = stringValue(properties[feature]);
                    if (not) {
                        // negative/not present query
                        if (contextValue) {
                            // we have a value
                            if (constant && contextValue !== constant) {
                                continue; // the values are NOT a match.
                            }
                            if (!constant && contextValue === 'false') {
                                continue;
                            }
                        }
                        else {
                            // no value
                            if (!constant || contextValue === 'false') {
                                continue;
                            }
                        }
                    }
                    else {
                        // positive/present query
                        if (contextValue) {
                            if (contextValue === constant || contextValue !== 'false' && !constant) {
                                continue;
                            }
                        }
                        else {
                            if (constant === 'false') {
                                continue;
                            }
                        }
                    }
                    continue queries; // no match
                }
                // we matched a whole query, we're good
                return true;
            }
        }
        // no query matched.
        return false;
    }
}
function stringValue(value) {
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
            return value.toString();
        case 'object':
            return value === null ? 'true' : Array.isArray(value) ? stringValue(value[0]) || 'true' : 'true';
    }
    return undefined;
}
class Query {
    expressions;
    constructor(expressions) {
        this.expressions = expressions;
    }
    static parse(cursor) {
        const result = new Array();
        takeWhitespace(cursor);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            result.push(Expression.parse(cursor));
            takeWhitespace(cursor);
            if (cursor.kind === scanner_1.Kind.AndKeyword) {
                cursor.take(); // consume and
                continue;
            }
            // the next token is not an 'and', so we bail now.
            return new Query(result);
        }
    }
}
class Expression {
    featureToken;
    constantToken;
    not;
    constructor(featureToken, constantToken, not) {
        this.featureToken = featureToken;
        this.constantToken = constantToken;
        this.not = not;
    }
    get feature() {
        return this.featureToken.text;
    }
    get constant() {
        return this.constantToken?.stringValue || this.constantToken?.text || undefined;
    }
    /** @internal */
    static parse(cursor, isNotted = false, inParen = false) {
        takeWhitespace(cursor);
        switch (cursor.kind) {
            case scanner_1.Kind.Identifier: {
                // start of an expression
                const feature = cursor.take();
                takeWhitespace(cursor);
                if (cursor.kind === scanner_1.Kind.Colon) {
                    cursor.take(); // consume colon;
                    // we have a constant for the
                    takeWhitespace(cursor);
                    switch (cursor.kind) {
                        case scanner_1.Kind.NumericLiteral:
                        case scanner_1.Kind.BooleanLiteral:
                        case scanner_1.Kind.Identifier:
                        case scanner_1.Kind.StringLiteral: {
                            // we have a good const value.
                            const constant = cursor.take();
                            return new Expression(feature, constant, isNotted);
                        }
                    }
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected one of {Number, Boolean, Identifier, String}, found token ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
                }
                return new Expression(feature, undefined, isNotted);
            }
            case scanner_1.Kind.NotKeyword:
                if (isNotted) {
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expression specified NOT twice`, cursor.position.line, cursor.position.column);
                }
                cursor.take(); // suck up the not token
                return Expression.parse(cursor, true, inParen);
            case scanner_1.Kind.OpenParen: {
                cursor.take();
                const result = Expression.parse(cursor, isNotted, inParen);
                takeWhitespace(cursor);
                if (cursor.kind !== scanner_1.Kind.CloseParen) {
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected close parenthesis for expression, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
                }
                cursor.take();
                return result;
            }
            default:
                throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected expression, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtcXVlcnkuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL21pY3Jvc29mdC92Y3BrZy10b29sL21haW4vdmNwa2ctYXJ0aWZhY3RzLyIsInNvdXJjZXMiOlsibWVkaWFxdWVyeS9tZWRpYS1xdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLGtDQUE0QjtBQUM1Qix1Q0FBa0U7QUFFbEUsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWpDLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixjQUFjLENBQUMsTUFBZTtJQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDMUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Y7QUFDSCxDQUFDO0FBSkQsd0NBSUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxNQUFlO0lBQ25DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxjQUFJLENBQUMsVUFBVSxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFNBQVM7SUFDYixPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQVMsQ0FBQztJQUM3QixJQUFJLE9BQU87UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBQ0QsS0FBSyxDQUFtQjtJQUV4QjtRQUNFLEVBQUU7SUFDSixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM3QixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFlO1FBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUks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
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7RIMqzBtVDBEEi9YmLtEo56ksmObt6DU0kuRGINTtyGg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCDmh8BJmRSWuXmz
// SIG // yvLv+UzVmm8FqDEZX4VN/rL8EAFfczBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBABYGobLSGxLfJbKE0MWbZeJmdALg5l0k
// SIG // ZCT0obXuGWEKXWwdpSgbOfZHByRi1MyMPYddwa6fMA9V
// SIG // VR+3OKGc8AEG309SSTdoqp9MemuoD+jsoP83jtk7rMor
// SIG // i2zcbcw22iG1QX9cjmcD7sSi1+ZBdWYK0Czyecphsosg
// SIG // 5xXkC3jGjF0xVAxNtbnL/3+eaEOTuStx5/9fNkeZV/TE
// SIG // mbDAGBqaVx5VkvUxfrorHl4yDWDLQDU5InGo5ri1EJx3
// SIG // JfxYd2G8l3PHzlAmw+PN4FjER/h2kYOay2EuMVvyBzdm
// SIG // 0uPkCyTnGWDXDY2vR5h/wJt9ZJr5/3MM+y1DOUTBQpdr
// SIG // XMGhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // f7AFl9YyH66oVvBQzWJGS7RbI5snhOBZGNklFB5ddJoC
// SIG // BmfcEYDJxhgTMjAyNTA0MDExOTU5MzkuNzc4WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjkyMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAIJCAfg+VyM5lUAAQAAAgkwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjU1WhcNMjYwNDIyMTk0MjU1WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjkyMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAwpRKMPcuDN39Uvc9cbTRBE8Fi9bxIosNKA+0lxHb
// SIG // +LHT9MbFconb+iNq5hJfD2LPS3GY87FjhyO3UJES9vBj
// SIG // 9wl3L2NGaup1rB2NkGpgmRSxdiJUR+gR8dkZDe2UQypr
// SIG // OwTqOCBgUZQjJFL/Tff7cDswJKVjbDN2/wUMXMIVYLEK
// SIG // rUPDRD1Lokfhlea3UB1E+KY4oWU5CcK2pYs9GW2KVEx+
// SIG // TpIt3dwacfaoj64geoYTXxj45dDyKdtw+e/a6VumZj6j
// SIG // 0/I9dil+8kmcDbsbNz2Lxf8NdxrEV5MyGyMiyhD84/Zc
// SIG // 5pqxdsI771K8fQGcOxi0l5NvA59V0n+toW5BblBsDxS6
// SIG // dxG0aiFZgWeNsHM+ZkiCAst0LP4cIRGIVJ3ZwAYDaQ+W
// SIG // rwCzle7FHyaxw2V1+n/YIG4yAOo9p4UgEiKpfBeS7Cgc
// SIG // NET7Q7st49gj8bU5maM2yyvEzLcQ4jAoMU6X4OYmFL8o
// SIG // VeGqmgy8EQbKAUYTv/ocMmyp2MF8Snnjq7DsEC52jhOQ
// SIG // ZhSWFgThc93fPCwSvUEQYHRB+Qi1Ye8JIDCHofenB+fh
// SIG // 9MRL5oOre7s7ZV19kle8XVGD8QN7441dxJFe2m0hw+Rx
// SIG // 0GU63dxarA/1TmAAlFQT68RfpFK2Rl8WCJ2U6a2DGBKu
// SIG // lCBtQ0+KQlT/Q3GgixiDmBCdYNMCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBRJi+jRxF045b3wL0DNtXczFpPK0jAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAXF58bzg8JOIf421AbJxZRba0
// SIG // rgQWW+8EmX2uZSkTEzXzZZmgAuG3e1qNCOYTMbBCVMrq
// SIG // R8IeJA+apEWXMyHNIyAAUENcQ1AWvlk8a6f1AKgte4ox
// SIG // Qnj2SmFYzax3/wZo8+xWjiONZMbnkYcCzSHENoJgag0e
// SIG // VuE0tobUSWMmQLO43yZmw7U3FDjIRJdTlpcfxZ73EG6L
// SIG // eVT82lMIk+jYnvJej2Y6ELLsYmrLkgJsSiEHbB5yeUKJ
// SIG // KsHcql4tRWQ7RE1b213w7KH807WuHp9qn+PIcxGcFL25
// SIG // M+bJrfPdJ1QCu5M9nK68zd4aZ3xbn7af61y1k78T0HH1
// SIG // l4hLiFHdhoO3kfELcirSQ1PPjw8BApM6GiY2xgiqsfRE
// SIG // oBSc861zcIYV+kXPINhFP/ut5pqlnghf5CThYNnicO2r
// SIG // v2mxEoKtxGs8g9VZS/h2l/jARxs0Jh7bzpt0JeMFUzd1
// SIG // qvF/GwkevKoheaxWrJuEcRes2o2Xkhwv6kud9+v+GjA6
// SIG // rFejvOkZTzwmBiTj7X9jGyju1ySXi/1EDdHN7oseUTE6
// SIG // OunWwE8T1BRBuT4eDx8xo1GxDuw9+S7hAYohvGK5TETp
// SIG // Bpd3wUJfW1m4MPQiFEG8KuXE2hMZXxKTHUqMnSaJVE0A
// SIG // +RCyhs9UyWoU4nXdtMJcIuQZN+lyJs7B+GLNeYl0XwIw
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
// SIG // Tjo5MjAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAfO+tqz00HeyJwwkHW9ZIBSkJAkSggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWYO8wIhgPMjAyNTA0MDExMjU2
// SIG // MTVaGA8yMDI1MDQwMjEyNTYxNVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65Zg7wIBADAHAgEAAgIRvzAHAgEA
// SIG // AgISEzAKAgUA65eybwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBVq4//Rja6
// SIG // FkUKTQIFy1yDbppKlwHmFWt/K5WjY1ix34rrFZMWScRb
// SIG // ElibGFAZ8e4cfYQHZwGI5BLick+5UHartpW5Fuad4u/k
// SIG // OP4BimuXd7G4mslLnIQBXxMnPjwkoDf5LPzi6Z/ss7tM
// SIG // IAWu8EQhbvjQssv+0XrT4Z1/SD7jtDZkQUIAA3ssGX/6
// SIG // oy2Na33zkUpCDlLmFdm5Hyy+FFmDTGObUFcSSJGjEZ9t
// SIG // CuP0gBvEH1G/weHrjF1D+zN/uT/O/af9NfWoJnX9L0NH
// SIG // vgtx6hHzT6bUiCz+n6MiHKfjUWnR4qEfcybykgPgDlyL
// SIG // uxSam1L1iPBpE98uOQswB9IWMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIJ
// SIG // CAfg+VyM5lUAAQAAAgkwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQggUru2E4D5jwfrfPnkQ91uD5mPgqT
// SIG // bFs5o9pqTm0IOk8wgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBoGyweyL30Ai5lDlGYY3VKivG4pHwemVVX
// SIG // aE4zcIUTPjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACCQgH4PlcjOZVAAEAAAIJMCIE
// SIG // ICpBN6s2Xmyn5rwFa7LgwQLE0qkLo1zRcrc1we6F53SP
// SIG // MA0GCSqGSIb3DQEBCwUABIICAIsYJbPFF7i5gHq9gm3t
// SIG // oW2v5goSXRxRiFqNkz9HAjQ7gaAU+FNZWlsyRGHhNJBo
// SIG // PgOLEH40yWv1F8Phw++wPGTfoLwuXuO8a2TM+MQf/UPN
// SIG // H15DYjbTwpRzCWPx25VdLSW942j80ZNTxCw2TkUQgfA2
// SIG // ZHuWtjuhLxtPNGNbwxHtUVu1kl6rtgwdk5DlMptSUTwY
// SIG // lUDqW9jUWPC7eld9gJ69QLAZplZ1OHbgMs1kFowJAnf4
// SIG // h2yxPhN7Ilis75ybUMkl9HEZ4Cm+vCJwSvEUp/tGz0qJ
// SIG // I+jBpL9BelLzhzHmt3SHcVhTqbAC7cdDshv9e1vFDQ2t
// SIG // MBOL+wqUle6XT0to3Vj7o3GYgqmaRB+sej7K8CdSf4QU
// SIG // jhRTRg0DBDjjGiAA9eClSYoOePx4e9SmfVphwMIUMhSo
// SIG // QMzEHaEr+TRVNw9khj+mDN4dIqOXFWqILa6EPQq3WvA9
// SIG // UwyagAbuWwN90OmqIKvz3YE4pVjt8c7gGDg/hdX+i6oT
// SIG // fezP9trOZGXQwkYOzokb7t8GCAeXFeVm4q5qoTa4Sz2D
// SIG // jCuqA0vIfX51+krAVeWKqHcCwF5OffWRMVuls2gj6tqB
// SIG // lED070RAZF+rlqg6vB/oZQVXAN9o7xxJgLF25hiPlGVG
// SIG // IH9JAdga8JDkUyV/OGIIfg3cc6HtNfS2TzdzyMEQMpfv
// SIG // y3ah
// SIG // End signature block
