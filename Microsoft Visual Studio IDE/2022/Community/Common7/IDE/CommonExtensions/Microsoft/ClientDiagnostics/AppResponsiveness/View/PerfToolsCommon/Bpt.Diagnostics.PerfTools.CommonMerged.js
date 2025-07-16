// 
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/enumHelper", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Enum = void 0;
    class Enum {
        static GetName(enumType, value) {
            var result;
            if (enumType) {
                for (var enumKey in enumType) {
                    if (enumType.hasOwnProperty(enumKey)) {
                        var enumValue = enumType[enumKey];
                        if (enumValue === value) {
                            result = enumKey;
                            break;
                        }
                    }
                }
            }
            if (!result) {
                result = value.toString();
            }
            return result;
        }
        static Parse(enumType, name, ignoreCase = true) {
            var result;
            if (enumType) {
                if (ignoreCase) {
                    name = name.toLowerCase();
                }
                for (var enumKey in enumType) {
                    if (enumType.hasOwnProperty(enumKey)) {
                        var compareAginst = enumKey.toString();
                        if (ignoreCase) {
                            compareAginst = compareAginst.toLowerCase();
                        }
                        if (name === compareAginst) {
                            result = enumType[enumKey];
                            break;
                        }
                    }
                }
            }
            return result;
        }
        static GetValues(enumType) {
            var result = [];
            if (enumType) {
                for (var enumKey in enumType) {
                    if (enumType.hasOwnProperty(enumKey)) {
                        var enumValue = enumType[enumKey];
                        if (typeof enumValue === "number") {
                            result.push(enumValue);
                        }
                    }
                }
            }
            return result;
        }
    }
    exports.Enum = Enum;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/eventHelper", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Publisher = void 0;
    /**
     * List of supported events.
     */
    class Publisher {
        /**
         * constructor
         * @param events List of supported events.
         */
        constructor(events) {
            /**
             * List of all registered events.
             */
            this._events = {};
            this._listeners = {};
            if (events && events.length > 0) {
                for (var i = 0; i < events.length; i++) {
                    var type = events[i];
                    if (type) {
                        this._events[type] = type;
                    }
                }
            }
            else {
                throw Error("Events are null or empty.");
            }
        }
        /**
         * Add event Listener
         * @param eventType Event type.
         * @param func Callback function.
         */
        addEventListener(eventType, func) {
            if (eventType && func) {
                var type = this._events[eventType];
                if (type) {
                    var callbacks = this._listeners[type] ? this._listeners[type] : this._listeners[type] = [];
                    callbacks.push(func);
                }
            }
        }
        /**
         * Remove event Listener
         * @param eventType Event type.
         * @param func Callback function.
         */
        removeEventListener(eventType, func) {
            if (eventType && func) {
                var callbacks = this._listeners[eventType];
                if (callbacks) {
                    for (var i = 0; i < callbacks.length; i++) {
                        if (func === callbacks[i]) {
                            callbacks.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
        /**
         * Invoke event Listener
         * @param args Event argument.
         */
        invokeListener(args) {
            if (args.type) {
                var callbacks = this._listeners[args.type];
                if (callbacks) {
                    for (var i = 0; i < callbacks.length; i++) {
                        var func = callbacks[i];
                        if (func) {
                            func(args);
                        }
                    }
                }
            }
        }
    }
    exports.Publisher = Publisher;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/formattingHelpers", ["require", "exports", "plugin-vs-v2"], function (require, exports, Plugin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormattingHelpers = void 0;
    class FormattingHelpers {
        static getDecimalLocaleString(numberToConvert, includeGroupSeparators, signficantDigits) {
            var numberString = Math.abs(numberToConvert).toString();
            // Get any exponent
            var split = numberString.split(/e/i);
            numberString = split[0];
            var exponent = (split.length > 1 ? parseInt(split[1], 10) : 0);
            // Get any decimal place
            split = numberString.split(".");
            numberString = (numberToConvert < 0 ? "-" : "") + split[0];
            // Get whole value
            var right = split.length > 1 ? split[1] : "";
            if (exponent > 0) {
                right = FormattingHelpers.zeroPad(right, exponent, false);
                numberString += right.slice(0, exponent);
                right = right.substr(exponent);
            }
            else if (exponent < 0) {
                exponent = -exponent;
                numberString = FormattingHelpers.zeroPad(numberString, exponent + 1, true);
                right = numberString.slice(-exponent, numberString.length) + right;
                numberString = numberString.slice(0, -exponent);
            }
            // Number format
            var nf = Plugin.Culture.numberFormat;
            if (!nf) {
                nf = { numberDecimalSeparator: ".", numberGroupSizes: [3], numberGroupSeparator: "," };
            }
            if (signficantDigits) {
                right = right.padEnd(signficantDigits, "0");
            }
            if (right.length > 0) {
                right = nf.numberDecimalSeparator + right;
            }
            // Grouping (e.g. 10,000)
            if (includeGroupSeparators === true) {
                var groupSizes = nf.numberGroupSizes, sep = nf.numberGroupSeparator, curSize = groupSizes[0], curGroupIndex = 1, stringIndex = numberString.length - 1, ret = "";
                while (stringIndex >= 0) {
                    if (curSize === 0 || curSize > stringIndex) {
                        if (ret.length > 0) {
                            return numberString.slice(0, stringIndex + 1) + sep + ret + right;
                        }
                        else {
                            return numberString.slice(0, stringIndex + 1) + right;
                        }
                    }
                    if (ret.length > 0) {
                        ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + sep + ret;
                    }
                    else {
                        ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1);
                    }
                    stringIndex -= curSize;
                    if (curGroupIndex < groupSizes.length) {
                        curSize = groupSizes[curGroupIndex];
                        curGroupIndex++;
                    }
                }
                return numberString.slice(0, stringIndex + 1) + sep + ret + right;
            }
            else {
                return numberString + right;
            }
        }
        static stripNewLine(text) {
            return text.replace(/[\r?\n]/g, "");
        }
        static zeroPad(stringToPad, newLength, padLeft) {
            var zeros = [];
            for (var i = stringToPad.length; i < newLength; i++) {
                zeros.push("0");
            }
            return (padLeft ? (zeros.join("") + stringToPad) : (stringToPad + zeros.join("")));
        }
    }
    exports.FormattingHelpers = FormattingHelpers;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/hostShell", ["require", "exports", "plugin-vs-v2"], function (require, exports, Plugin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalHostShell = exports.HostShellProxy = void 0;
    //
    // HostDisplayProxy provides access to the Display which is implemented in the host
    //
    class HostShellProxy {
        constructor() {
            this._hostShellProxy = Plugin.JSONMarshaler.attachToMarshaledObject("Microsoft.VisualStudio.WebClient.Diagnostics.PerformanceToolHost.Package.Extensions.Core.HostShell", {}, true);
        }
        setStatusBarText(text, highlight) {
            return this._hostShellProxy._call("setStatusBarText", text, highlight || false);
        }
    }
    exports.HostShellProxy = HostShellProxy;
    //
    // LocalDisplay implements a local display object without the need to use the host
    //
    class LocalHostShell {
        setStatusBarText(statusText, highlight) {
            return Promise.resolve(null);
        }
    }
    exports.LocalHostShell = LocalHostShell;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/TokenExtractor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenExtractor = exports.AssignmentRegexGroup = exports.HtmlRegexGroup = exports.TokenType = void 0;
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["General"] = 0] = "General";
        TokenType[TokenType["String"] = 1] = "String";
        TokenType[TokenType["Number"] = 2] = "Number";
        TokenType[TokenType["Html"] = 3] = "Html";
        TokenType[TokenType["HtmlTagName"] = 4] = "HtmlTagName";
        TokenType[TokenType["HtmlTagDelimiter"] = 5] = "HtmlTagDelimiter";
        TokenType[TokenType["HtmlAttributeName"] = 6] = "HtmlAttributeName";
        TokenType[TokenType["HtmlAttributeValue"] = 7] = "HtmlAttributeValue";
        TokenType[TokenType["EqualOperator"] = 8] = "EqualOperator";
    })(TokenType = exports.TokenType || (exports.TokenType = {}));
    var HtmlRegexGroup;
    (function (HtmlRegexGroup) {
        HtmlRegexGroup[HtmlRegexGroup["PreHtmlString"] = 1] = "PreHtmlString";
        HtmlRegexGroup[HtmlRegexGroup["StartDelimiter"] = 2] = "StartDelimiter";
        HtmlRegexGroup[HtmlRegexGroup["TagName"] = 3] = "TagName";
        HtmlRegexGroup[HtmlRegexGroup["IdAttribute"] = 4] = "IdAttribute";
        HtmlRegexGroup[HtmlRegexGroup["IdEqualToToken"] = 5] = "IdEqualToToken";
        HtmlRegexGroup[HtmlRegexGroup["IdAttributeValue"] = 6] = "IdAttributeValue";
        HtmlRegexGroup[HtmlRegexGroup["ClassAttribute"] = 7] = "ClassAttribute";
        HtmlRegexGroup[HtmlRegexGroup["ClassEqualToToken"] = 8] = "ClassEqualToToken";
        HtmlRegexGroup[HtmlRegexGroup["ClassAttributeValue"] = 9] = "ClassAttributeValue";
        HtmlRegexGroup[HtmlRegexGroup["SrcAttribute"] = 10] = "SrcAttribute";
        HtmlRegexGroup[HtmlRegexGroup["SrcEqualToToken"] = 11] = "SrcEqualToToken";
        HtmlRegexGroup[HtmlRegexGroup["SrcAttributeValue"] = 12] = "SrcAttributeValue";
        HtmlRegexGroup[HtmlRegexGroup["EndDelimiter"] = 13] = "EndDelimiter";
        HtmlRegexGroup[HtmlRegexGroup["PostHtmlString"] = 14] = "PostHtmlString";
    })(HtmlRegexGroup = exports.HtmlRegexGroup || (exports.HtmlRegexGroup = {}));
    var AssignmentRegexGroup;
    (function (AssignmentRegexGroup) {
        AssignmentRegexGroup[AssignmentRegexGroup["LeftHandSide"] = 1] = "LeftHandSide";
        AssignmentRegexGroup[AssignmentRegexGroup["EqualToOperator"] = 2] = "EqualToOperator";
        AssignmentRegexGroup[AssignmentRegexGroup["RightHandSide"] = 3] = "RightHandSide";
        AssignmentRegexGroup[AssignmentRegexGroup["PostString"] = 4] = "PostString";
    })(AssignmentRegexGroup = exports.AssignmentRegexGroup || (exports.AssignmentRegexGroup = {}));
    class TokenExtractor {
        static getHtmlTokens(text) {
            var tokenTypeMap = [];
            if (!text) {
                return tokenTypeMap;
            }
            var tokens = TokenExtractor.HTML_REGEX.exec(text);
            if (tokens) {
                // First token - tokens[0] is the entire matched string, skip it.
                if (tokens[HtmlRegexGroup.PreHtmlString]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[HtmlRegexGroup.PreHtmlString].toString() });
                }
                if (tokens[HtmlRegexGroup.StartDelimiter]) {
                    tokenTypeMap.push({ type: TokenType.HtmlTagDelimiter, value: tokens[HtmlRegexGroup.StartDelimiter].toString() });
                }
                if (tokens[HtmlRegexGroup.TagName]) {
                    tokenTypeMap.push({ type: TokenType.HtmlTagName, value: tokens[HtmlRegexGroup.TagName].toString() });
                }
                if (tokens[HtmlRegexGroup.IdAttribute]) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeName, value: tokens[HtmlRegexGroup.IdAttribute].toString() });
                }
                if (tokens[HtmlRegexGroup.IdEqualToToken]) {
                    tokenTypeMap.push({ type: TokenType.EqualOperator, value: tokens[HtmlRegexGroup.IdEqualToToken].toString() });
                }
                if (tokens[HtmlRegexGroup.IdAttributeValue] !== undefined) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeValue, value: tokens[HtmlRegexGroup.IdAttributeValue].toString() });
                }
                if (tokens[HtmlRegexGroup.ClassAttribute]) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeName, value: tokens[HtmlRegexGroup.ClassAttribute].toString() });
                }
                if (tokens[HtmlRegexGroup.ClassEqualToToken]) {
                    tokenTypeMap.push({ type: TokenType.EqualOperator, value: tokens[HtmlRegexGroup.ClassEqualToToken].toString() });
                }
                if (tokens[HtmlRegexGroup.ClassAttributeValue] !== undefined) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeValue, value: tokens[HtmlRegexGroup.ClassAttributeValue].toString() });
                }
                if (tokens[HtmlRegexGroup.SrcAttribute]) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeName, value: tokens[HtmlRegexGroup.SrcAttribute].toString() });
                }
                if (tokens[HtmlRegexGroup.SrcEqualToToken]) {
                    tokenTypeMap.push({ type: TokenType.EqualOperator, value: tokens[HtmlRegexGroup.SrcEqualToToken].toString() });
                }
                if (tokens[HtmlRegexGroup.SrcAttributeValue] !== undefined) {
                    tokenTypeMap.push({ type: TokenType.HtmlAttributeValue, value: tokens[HtmlRegexGroup.SrcAttributeValue].toString() });
                }
                if (tokens[HtmlRegexGroup.EndDelimiter]) {
                    tokenTypeMap.push({ type: TokenType.HtmlTagDelimiter, value: tokens[HtmlRegexGroup.EndDelimiter].toString() });
                }
                if (tokens[HtmlRegexGroup.PostHtmlString]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[HtmlRegexGroup.PostHtmlString].toString() });
                }
            }
            else {
                // If for some reason regex fails just mark it as general token so that the object doesn't go missing
                tokenTypeMap.push({ type: TokenType.General, value: text });
            }
            return tokenTypeMap;
        }
        static getStringTokens(text) {
            var tokenTypeMap = [];
            if (!text) {
                return tokenTypeMap;
            }
            var tokens = TokenExtractor.STRING_REGEX.exec(text);
            if (tokens) {
                if (tokens[AssignmentRegexGroup.LeftHandSide]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.LeftHandSide].toString() });
                }
                if (tokens[AssignmentRegexGroup.EqualToOperator]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.EqualToOperator].toString() });
                }
                if (tokens[AssignmentRegexGroup.RightHandSide]) {
                    tokenTypeMap.push({ type: TokenType.String, value: tokens[AssignmentRegexGroup.RightHandSide].toString() });
                }
                if (tokens[AssignmentRegexGroup.PostString]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.PostString].toString() });
                }
            }
            else {
                tokenTypeMap.push({ type: TokenType.General, value: text });
            }
            return tokenTypeMap;
        }
        static getNumberTokens(text) {
            var tokenTypeMap = [];
            if (!text) {
                return tokenTypeMap;
            }
            var tokens = TokenExtractor.NUMBER_REGEX.exec(text);
            if (tokens) {
                if (tokens[AssignmentRegexGroup.LeftHandSide]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.LeftHandSide].toString() });
                }
                if (tokens[AssignmentRegexGroup.EqualToOperator]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.EqualToOperator].toString() });
                }
                if (tokens[AssignmentRegexGroup.RightHandSide]) {
                    tokenTypeMap.push({ type: TokenType.Number, value: tokens[AssignmentRegexGroup.RightHandSide].toString() });
                }
                if (tokens[AssignmentRegexGroup.PostString]) {
                    tokenTypeMap.push({ type: TokenType.General, value: tokens[AssignmentRegexGroup.PostString].toString() });
                }
            }
            else {
                tokenTypeMap.push({ type: TokenType.General, value: text });
            }
            return tokenTypeMap;
        }
        static getCssClass(tokenType) {
            switch (tokenType) {
                case TokenType.String:
                    return "valueStringToken-String";
                case TokenType.Number:
                    return "valueStringToken-Number";
                case TokenType.HtmlTagName:
                    return "perftools-Html-Element-Tag";
                case TokenType.HtmlAttributeName:
                    return "perftools-Html-Attribute";
                case TokenType.HtmlAttributeValue:
                    return "perftools-Html-Value";
                case TokenType.HtmlTagDelimiter:
                    return "perftools-Html-Tag";
                case TokenType.EqualOperator:
                    return "perftools-Html-Operator";
                default:
                    return "";
            }
        }
        static isHtmlExpression(text) {
            return TokenExtractor.GENERAL_HTML_REGEX.test(text);
        }
        static isStringExpression(text) {
            return TokenExtractor.STRING_REGEX.test(text);
        }
    }
    exports.TokenExtractor = TokenExtractor;
    TokenExtractor.GENERAL_HTML_REGEX = /^<.*>/;
    TokenExtractor.HTML_REGEX = /(^.*)?(<)([^\s]+)(?:( id)(=)(\".*?\"))?(?:( class)(=)(\".*?\"))?(?:( src)(=)(\".*?\"))?(>)(.*$)?/;
    TokenExtractor.NUMBER_REGEX = /(.*)?(=)( ?-?\d+(?:.\d+)?)(.*$)?/;
    TokenExtractor.STRING_REGEX = /(^.*?)(=)( ?\".*\")(.*$)?/;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/Notifications", ["require", "exports", "plugin-vs-v2"], function (require, exports, Plugin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Notifications = void 0;
    class Notifications {
        static get isTestMode() {
            return window["TestMode"];
        }
        static get notifications() {
            if (!Notifications._notifications) {
                Notifications._notifications = new Plugin.EventManager(null);
            }
            return Notifications._notifications;
        }
        static subscribe(type, listener) {
            if (Notifications.isTestMode) {
                Notifications.notifications.addEventListener(type, listener);
            }
        }
        static unsubscribe(type, listener) {
            if (Notifications.isTestMode) {
                Notifications.notifications.removeEventListener(type, listener);
            }
        }
        static subscribeOnce(type, listener) {
            if (Notifications.isTestMode) {
                function onNotify() {
                    Notifications.unsubscribe(type, onNotify);
                    listener.apply(this, arguments);
                }
                Notifications.subscribe(type, onNotify);
            }
        }
        static notify(type, details) {
            if (Notifications.isTestMode) {
                Notifications.notifications.dispatchEvent(type, details);
            }
        }
    }
    exports.Notifications = Notifications;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/controls/SourceInfoTooltip", ["require", "exports", "plugin-vs-v2", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/formattingHelpers"], function (require, exports, Plugin, formattingHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceInfoTooltip = void 0;
    class SourceInfoTooltip {
        constructor(sourceInfo, name, nameLabelResourceId) {
            this._rootContainer = document.createElement("div");
            this._rootContainer.className = "sourceInfoTooltip";
            if (name && nameLabelResourceId) {
                this.addDiv("sourceInfoNameLabel", Plugin.Resources.getString(nameLabelResourceId));
                this.addDiv("sourceInfoName", name);
            }
            this.addDiv("sourceInfoFileLabel", Plugin.Resources.getString("SourceInfoFileLabel"));
            this.addDiv("sourceInfoFile", sourceInfo.source);
            this.addDiv("sourceInfoLineLabel", Plugin.Resources.getString("SourceInfoLineLabel"));
            this.addDiv("sourceInfoLine", formattingHelpers_1.FormattingHelpers.getDecimalLocaleString(sourceInfo.line, /*includeGroupSeparators=*/ true));
            this.addDiv("sourceInfoColumnLabel", Plugin.Resources.getString("SourceInfoColumnLabel"));
            this.addDiv("sourceInfoColumn", formattingHelpers_1.FormattingHelpers.getDecimalLocaleString(sourceInfo.column, /*includeGroupSeparators=*/ true));
        }
        get html() {
            return this._rootContainer.outerHTML;
        }
        addDiv(className, textContent) {
            var div = document.createElement("div");
            div.className = className;
            div.textContent = textContent;
            this._rootContainer.appendChild(div);
        }
    }
    exports.SourceInfoTooltip = SourceInfoTooltip;
});
//
// Copyright (C) Microsoft. All rights reserved.
//s
define("src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/controls/API", ["require", "exports", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/controls/SourceInfoTooltip"], function (require, exports, SourceInfoTooltip_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceInfoTooltip = void 0;
    Object.defineProperty(exports, "SourceInfoTooltip", { enumerable: true, get: function () { return SourceInfoTooltip_1.SourceInfoTooltip; } });
});
//
// Copyright (C) Microsoft. All rights reserved.
//
define("Bpt.Diagnostics.PerfTools.Common", ["require", "exports", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/enumHelper", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/eventHelper", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/formattingHelpers", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/hostShell", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/hostShell", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/TokenExtractor", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/TokenExtractor", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/TokenExtractor", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/TokenExtractor", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/Notifications", "src/edev/ClientDiagnostics/Source/AppResponsiveness/View/bpt.diagnostics.perftools.common/controls/API"], function (require, exports, enumHelper_1, eventHelper_1, formattingHelpers_2, hostShell_1, hostShell_2, TokenExtractor_1, TokenExtractor_2, TokenExtractor_3, TokenExtractor_4, Notifications_1, Controls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Controls = exports.Notifications = exports.TokenExtractor = exports.AssignmentRegexGroup = exports.HtmlRegexGroup = exports.TokenType = exports.LocalHostShell = exports.HostShellProxy = exports.FormattingHelpers = exports.Publisher = exports.Enum = void 0;
    Object.defineProperty(exports, "Enum", { enumerable: true, get: function () { return enumHelper_1.Enum; } });
    Object.defineProperty(exports, "Publisher", { enumerable: true, get: function () { return eventHelper_1.Publisher; } });
    Object.defineProperty(exports, "FormattingHelpers", { enumerable: true, get: function () { return formattingHelpers_2.FormattingHelpers; } });
    Object.defineProperty(exports, "HostShellProxy", { enumerable: true, get: function () { return hostShell_1.HostShellProxy; } });
    Object.defineProperty(exports, "LocalHostShell", { enumerable: true, get: function () { return hostShell_2.LocalHostShell; } });
    Object.defineProperty(exports, "TokenType", { enumerable: true, get: function () { return TokenExtractor_1.TokenType; } });
    Object.defineProperty(exports, "HtmlRegexGroup", { enumerable: true, get: function () { return TokenExtractor_2.HtmlRegexGroup; } });
    Object.defineProperty(exports, "AssignmentRegexGroup", { enumerable: true, get: function () { return TokenExtractor_3.AssignmentRegexGroup; } });
    Object.defineProperty(exports, "TokenExtractor", { enumerable: true, get: function () { return TokenExtractor_4.TokenExtractor; } });
    Object.defineProperty(exports, "Notifications", { enumerable: true, get: function () { return Notifications_1.Notifications; } });
    exports.Controls = Controls;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
//# sourceMappingURL=Bpt.Diagnostics.PerfTools.CommonMerged.js.map
// SIG // Begin signature block
// SIG // MIIoRAYJKoZIhvcNAQcCoIIoNTCCKDECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // HRZWwKguevM8ZV4l3BWf/bAa/CDjAcwuOdmy4uwkE4+g
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghomMIIaIgIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCC1tKLK/t2GzSzOem2OxacZzcnHM6pveqPW
// SIG // jvPiHH3CeDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBACtORcBY
// SIG // 4n4tlKJSD1cTGF8BATnVVLf42t747S5KDhwLaRRUMToZ
// SIG // CRdok56THGss63l+00qfSLmEO94aZyVsRXHQKpezik4U
// SIG // tQ0/8ky3BM0c68xOB/b5qWHlBl9DMtMc/6CfmIP9v94K
// SIG // W86ab+/e+9EDFeodbfGFioKliFA3E5pYR+6W/fbfQJmr
// SIG // NmtaHYlZVvnZByEEwRBRsjOD2fRHytn9cxrPOWUNgE/5
// SIG // 8/IwaZbngc7xkcqw3TQJJyrsO+30QQNObozBdtwxKCT4
// SIG // 7EVjNmxLwQIQzP4g6MtSxu9ULJ7P/dOSdpmYFz0d8DGf
// SIG // AIOZA/9VzjMi4UD+5PAlT8tW+fWhghewMIIXrAYKKwYB
// SIG // BAGCNwMDATGCF5wwgheYBgkqhkiG9w0BBwKggheJMIIX
// SIG // hQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgP5i8v1eztMTgfScLOF6C
// SIG // 5J/sLJU3EYWoEPQflCRZwAACBmftLaSvaxgTMjAyNTA0
// SIG // MTUxOTI4MDIuMjMxWjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046MkExQS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH+MIIHKDCCBRCgAwIBAgITMwAAAfkf
// SIG // Z411q6TxsQABAAAB+TANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMDlaFw0yNTEwMjIxODMxMDlaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjoyQTFBLTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBALQ9TB98gB1hzVbJQvggU4/zKXeeSwz7UK4Te1nq
// SIG // hYUXgvcSl0o6G1tWR8x1PFdgTiVImIO3wydgMRlRsqL1
// SIG // LYBmYNvhmrhSpN2Y47C0rKnoWCLFEK4F/q/1QE2lvPzj
// SIG // VsupTshmcGacX1dhF+KgIepm9oWnQLr3W0ZdUCtbXwZU
// SIG // d33XggUBvsm8/SRWeOSzdqbPDXNca+NTfEItylSS2F9I
// SIG // mxGwJJLEeG27Mws72Pr3Uq41sigI0emIGIWgWg8RNigy
// SIG // drEERRRf3oAsSoKIHRd1SCaAhP1rsvTLhIMqXmtR3ou5
// SIG // RRr3S0GR+SaNkEebjfIYjHPGeO0USbiFgjnsiCdWJ0Yo
// SIG // om6VGe9vsKb/C06L9Mh+guR0fw/PgE+L6rT+eyE17A/Q
// SIG // zzqG/LY7bHnz3ECXm1DYqsn8ky+Y+fyftnfhjwnFxGKH
// SIG // lmfp67GUn63eQxzOKLwpg95Yn4GJ84zq8uIIUE/3L5nR
// SIG // 8Ba+siRqYVvxxvBkHfnAeMO8BqToR1SW8uOJBlSvDM2P
// SIG // bN9g8tUx5yYPKe8tbBBs/wNcvOGbeoCLCE2GnHB4QSqe
// SIG // HDlTa36EVVMdhv9E6+w5N36QlPLvuaJajz8CoGbOe45f
// SIG // pTq0VbF9QGBJgJ8gshq6kQM6Rl8pNR7zSAaUjTbkwUJO
// SIG // xQb7vmKYugO0tldk4+pc2FlQb7hhAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQUie2jupyVySPXoo80uUJEdkZZ4AAw
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAGYgCYBW5H+434cf5pmZZxma
// SIG // 6WnvhxqcVsbPCO/b1G/BkKLudDNZ7O4sBtgnHaF2qu1Y
// SIG // KVZDX9bryIaxmKSggV0PkmidjtAb8LiUe1LIE2ijdI/8
// SIG // n936Rw9JLR/hJBLhl7PQwS8re9YrrVZMKMPYkJkpOKCC
// SIG // vEvAKzRqUjs3rrvU3SYwY7GrJriftquU45q4BCsj3t0w
// SIG // KQIqPHHcP29XAQJo7SO7aTWFeT8kSNytTYbg4HxI+ZMp
// SIG // xhf7osz9Tbh0sRf1dZLP9rQhKK4onDOJNTyU0wNEwozW
// SIG // 5KZgXLADJcU8wZ1rKpwQrfXflHfVWtyMPQbOHHK5IAYy
// SIG // 7YN72BmGq+teaH2LVPnbqfi7lNHdsAQxBtZ4Ulh2jvrt
// SIG // sukotwGjSDbf6TjClOpeAFtLg1lB9/Thx9xKhR7U7LGV
// SIG // 2gzo7ckYG6jBppH/CiN6iFQWSdl0KZ4RLkW4fgIKZkZ/
// SIG // 2uNdA5O1bT4NrguNtliwvB/CFZPxXqIkkuLxaHYZ3BXr
// SIG // SdGSt+sMQGtxYj4AXm0VslbWe+t6gw88Q29Jgehy/RxH
// SIG // 02zfuKBwpGWtRypfAdLPEYhQTH/1u/juxD2fsDB/MHZI
// SIG // 2e0m7HXbXUYEQEakfCBT1rq0PrJ+37RIn2qI87ghGoUg
// SIG // HKvOso8EHkzzfWBvW9+EU7q55KQ/sDxkwdVnHDKbC5TN
// SIG // MIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJmQAAAAAA
// SIG // FTANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
// SIG // dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMw
// SIG // MTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEB
// SIG // BQADggIPADCCAgoCggIBAOThpkzntHIhC3miy9ckeb0O
// SIG // 1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+F2Az/1xP
// SIG // x2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQGOhgfWpS
// SIG // g0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/Y
// SIG // JlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oaezOtgFt+
// SIG // jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/dvI2k45GP
// SIG // sjksUZzpcGkNyjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6
// SIG // BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXAhjBcTyzi
// SIG // YrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31B
// SIG // mkZ1zcRfNN0Sidb9pSB9fvzZnkXftnIv231fgLrbqn42
// SIG // 7DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n
// SIG // 6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLR
// SIG // vWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK12NvDMk2
// SIG // ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9
// SIG // stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUXk8A8
// SIG // FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3tz5q4i6t
// SIG // AgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEEBQIDAQAB
// SIG // MCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q
// SIG // /y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ
// SIG // 6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/
// SIG // BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMG
// SIG // A1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQM
// SIG // HgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMB
// SIG // Af8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjR
// SIG // PZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6
// SIG // Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1
// SIG // Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBa
// SIG // BggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWlj
// SIG // Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Geckv8qW/q
// SIG // XBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQdTltuw8x
// SIG // 5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6cqYJWAAOw
// SIG // Bb6J6Gngugnue99qb74py27YP0h1AdkY3m2CDPVtI1Tk
// SIG // eFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQJL1AoL8Z
// SIG // thISEV09J+BAljis9/kpicO8F7BUhUKz/AyeixmJ5/AL
// SIG // aoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTpkbKpW99J
// SIG // o3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32
// SIG // THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEU
// SIG // BHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsN
// SIG // n6Qo3GcZKCS6OEuabvshVGtqRRFHqfG3rsjoiV5PndLQ
// SIG // THa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+
// SIG // y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10Cga
// SIG // iQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi6vAnQj0l
// SIG // lOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHIqzqKOghi
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCA1kw
// SIG // ggJBAgEBMIIBAaGB2aSB1jCB0zELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046MkExQS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAKrOVo1ju81QCpiHHcIaoGb8
// SIG // qelGoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDrqM7LMCIYDzIw
// SIG // MjUwNDE1MTIyNTQ3WhgPMjAyNTA0MTYxMjI1NDdaMHcw
// SIG // PQYKKwYBBAGEWQoEATEvMC0wCgIFAOuozssCAQAwCgIB
// SIG // AAICIRgCAf8wBwIBAAICFUgwCgIFAOuqIEsCAQAwNgYK
// SIG // KwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgC
// SIG // AQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsF
// SIG // AAOCAQEApcJTZBTToNNWJtVV5IqpAsjzYBCjL6dsiftD
// SIG // 6TKqeaCnaukjOF3JWUbTa+JP4CMynxplQ07JZHjKiK4k
// SIG // 1Wc9Q+n8CkZBProy/ozN4AiFJsaWg/BOjeVuwR+B7ZHd
// SIG // yieEbJz71unbBEoMhoo0t/iSX2VtO8c2I/ENBlGg8y8y
// SIG // tTWza298VZciIRceIE5Mtm1JlVx2U5D++7lZPx+HOrJh
// SIG // UUI+2NuBR7qMDpQsAeq6z83vHAm8qsP4rGJgvSPXsKQH
// SIG // Flir44Xd2mnWfMSXhtDJVd4igvQZNyYlkxX5rv7puAE2
// SIG // x58TvyN+0Dv1hFqdzjT5EVVaOqzSafr9y2lXk7KeajGC
// SIG // BA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAAB+R9njXWrpPGxAAEAAAH5MA0GCWCG
// SIG // SAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZI
// SIG // hvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIG/BluwnE8ZH
// SIG // NE2MBQHiGRi0l1YaG7Fvu2nc17lFDxOKMIH6BgsqhkiG
// SIG // 9w0BCRACLzGB6jCB5zCB5DCBvQQgOSOMyB7wjftk+ukV
// SIG // Diwma1BFXaCpSpfFXgjuUmxi2BAwgZgwgYCkfjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAfkfZ411
// SIG // q6TxsQABAAAB+TAiBCAC7H30EYn60UJ0DraihsDQTqfm
// SIG // IByDZ5+W8NXJT4QWbjANBgkqhkiG9w0BAQsFAASCAgBV
// SIG // sEHRhr07qqNnxRYgvWZokpoVe7V+jn8/iyQJo35lTatO
// SIG // BncYF7pWHXDUr2yn60wbcmLGqP+psm9Bysf4Q3NdL4Vb
// SIG // dcGgVnJOFjCDZxWCDWbwYzFBLGW9wwERRSIWH5Vs9Iw/
// SIG // Jlj0TghhnnZIavzNE2/kja0pUSgVbJcH87l+0nKnqkWs
// SIG // m6JagbHiDxHQRHxPbU5Q+9AWmTdkvIJffyvcCuw6zZKR
// SIG // w8beL0mhKPYQOmp5VrWnY2rwel0Y9c8rw3tThF6HQqwZ
// SIG // AO2zV90nlvVcQqk+ZG1rOf7Zqxm5VWA4nfWGyQ7VVqP8
// SIG // Hk+UdenkBE+UNpnzVnLz3uS+DQGuWEIyS0xuh5TK1sJG
// SIG // Jd3vfC11RTPkWXNp2iRQCCOGtIGD1Di5sodCRH9WxRvu
// SIG // zUrVmnTTZrBgmUc4x9YFRjZQUcgohKLmGUP02tE9EqPS
// SIG // k4nRRkrLwhqAoUkXBCwRPB+XvGZyzH7yNuZwL0Vu4zPT
// SIG // 8SA3gff+J9W4E9iZVACmXkbiXeCJtBB119K3/4nGAZQZ
// SIG // tsCs++ifN8mf2PYfOUiSpAN1zjNpGWlB66jpGbxg1UAH
// SIG // VItHe7gLlrlNcsV/X8i1Y/WDb4G9VvHUOKNRPna5wOZO
// SIG // qdtoJM3VBx68h85KqwewRYPr2Nysd48P3AoQQAwWcJ4b
// SIG // dUmgwirf+O5B4RsI8wD7ew==
// SIG // End signature block
