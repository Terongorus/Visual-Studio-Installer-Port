"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataFile = void 0;
const path_1 = require("path");
const yaml_1 = require("yaml");
const i18n_1 = require("../i18n");
const error_kind_1 = require("../interfaces/error-kind");
const BaseMap_1 = require("../yaml/BaseMap");
const Options_1 = require("../yaml/Options");
const contact_1 = require("./contact");
const demands_1 = require("./demands");
const info_1 = require("./info");
const registries_1 = require("./registries");
class MetadataFile extends BaseMap_1.BaseMap {
    document;
    filename;
    file;
    lineCounter;
    registryUri;
    constructor(document, filename, file, lineCounter, registryUri) {
        super(document.contents);
        this.document = document;
        this.filename = filename;
        this.file = file;
        this.lineCounter = lineCounter;
        this.registryUri = registryUri;
    }
    static async parseMetadata(filename, uri, session, registryUri) {
        return MetadataFile.parseConfiguration(filename, await uri.readUTF8(), session, registryUri);
    }
    static async parseConfiguration(filename, content, session, registryUri) {
        const lc = new yaml_1.LineCounter();
        if (!content || content === 'null') {
            content = '{\n}';
        }
        const doc = (0, yaml_1.parseDocument)(content, { prettyErrors: false, lineCounter: lc, strict: true });
        return new MetadataFile(doc, filename, session.fileSystem.file((0, path_1.resolve)(filename)), lc, registryUri);
    }
    #info = new info_1.Info(undefined, this, 'info');
    contacts = new contact_1.Contacts(undefined, this, 'contacts');
    registries = new registries_1.RegistriesDeclaration(undefined, this, 'registries');
    // rather than re-implement it, use encapsulation with a demand block
    demandBlock = new demands_1.DemandBlock(this.node, undefined);
    /** Artifact identity
   *
   * this should be the 'path' to the artifact (following the guidelines)
   *
   * ie, 'compilers/microsoft/msvc'
   *
   * artifacts install to artifacts-root/<source>/<id>/<VER>
   */
    get id() { return this.asString(this.getMember('id')) || this.#info.id || ''; }
    set id(value) { this.normalize(); this.setMember('id', value); }
    /** the version of this artifact */
    get version() { return this.asString(this.getMember('version')) || this.#info.version || ''; }
    set version(value) { this.normalize(); this.setMember('version', value); }
    /** a short 1 line descriptive text */
    get summary() { return this.asString(this.getMember('summary')) || this.#info.summary; }
    set summary(value) { this.normalize(); this.setMember('summary', value); }
    /** if a longer description is required, the value should go here */
    get description() { return this.asString(this.getMember('description')) || this.#info.description; }
    set description(value) { this.normalize(); this.setMember('description', value); }
    #options = new Options_1.Options(undefined, this, 'options');
    /** if true, intended to be used only as a dependency; for example, do not show in search results or lists */
    get dependencyOnly() { return this.#options.has('dependencyOnly') || this.#info.options.has('dependencyOnly'); }
    get espidf() { return this.#options.has('espidf') || this.#info.options.has('espidf'); }
    /** higher priority artifacts should install earlier; the default is zero */
    get priority() { return this.asNumber(this.getMember('priority')) || this.#info.priority || 0; }
    set priority(value) { this.normalize(); this.setMember('priority', value); }
    get error() { return this.demandBlock.error; }
    set error(value) { this.demandBlock.error = value; }
    get warning() { return this.demandBlock.warning; }
    set warning(value) { this.demandBlock.warning = value; }
    get message() { return this.demandBlock.message; }
    set message(value) { this.demandBlock.message = value; }
    get requires() { return this.demandBlock.requires; }
    get exports() { return this.demandBlock.exports; }
    get install() { return this.demandBlock.install; }
    conditionalDemands = new demands_1.Demands(undefined, this, 'demands');
    get isFormatValid() {
        return this.document.errors.length === 0;
    }
    toJsonString() {
        let content = JSON.stringify(this.document.toJSON(), null, 2);
        if (!content || content === 'null') {
            content = '{}\n';
        }
        return content;
    }
    async save(uri = this.file) {
        await uri.writeUTF8(this.toJsonString());
    }
    #errors;
    get formatErrors() {
        const t = this;
        return this.#errors || (this.#errors = this.document.errors.map(each => {
            const message = each.message;
            const line = each.linePos?.[0].line || 1;
            const column = each.linePos?.[0].col || 1;
            return t.formatMessage(each.name, message, line, column);
        }));
    }
    /** @internal */ formatMessage(category, message, line, column) {
        if (line !== undefined && column !== undefined) {
            return `${this.filename}:${line}:${column} ${category}, ${message}`;
        }
        else {
            return `${this.filename}: ${category}, ${message}`;
        }
    }
    formatVMessage(vMessage) {
        const message = vMessage.message;
        const range = vMessage.range;
        const rangeOffset = vMessage.rangeOffset;
        const category = vMessage.category;
        const r = Array.isArray(range) ? range : range?.sourcePosition();
        const { line, column } = this.positionAt(r, rangeOffset);
        return this.formatMessage(category, message, line, column);
    }
    *deprecationWarnings() {
        const node = this.node;
        if (node) {
            const info = node.get('info');
            if (info) {
                const infoNode = info;
                yield {
                    message: (0, i18n_1.i) `The info block is deprecated for consistency with vcpkg.json; move info members to the outside.`,
                    range: infoNode.range || undefined,
                    category: error_kind_1.ErrorKind.InfoBlockPresent
                };
            }
        }
    }
    positionAt(range, offset) {
        const { line, col } = this.lineCounter.linePos(range?.[0] || 0);
        return offset ? {
            // adds the offset values (which can come from the mediaquery parser) to the line & column. If MQ doesn't have a position, it's zero.
            line: line + (offset.line - 1),
            column: col + (offset.column - 1),
        } :
            {
                line, column: col
            };
    }
    /** @internal */
    *validate() {
        yield* super.validate();
        const hasInfo = this.document.has('info');
        const allowedChildren = ['contacts', 'registries', 'demands', 'exports', 'requires', 'install'];
        if (hasInfo) {
            // 2022-06-17 and earlier used a separate 'info' block for these fields
            allowedChildren.push('info');
        }
        else {
            allowedChildren.push('version', 'id', 'summary', 'priority', 'description', 'options');
        }
        yield* this.validateChildKeys(allowedChildren);
        if (hasInfo) {
            yield* this.#info.validate();
        }
        else {
            if (!this.has('id')) {
                yield { message: (0, i18n_1.i) `Missing identity '${'id'}'`, range: this, category: error_kind_1.ErrorKind.FieldMissing };
            }
            else if (!this.childIs('id', 'string')) {
                yield { message: (0, i18n_1.i) `id should be of type 'string', found '${this.kind('id')}'`, range: this.sourcePosition('id'), category: error_kind_1.ErrorKind.IncorrectType };
            }
            if (!this.has('version')) {
                yield { message: (0, i18n_1.i) `Missing version '${'version'}'`, range: this, category: error_kind_1.ErrorKind.FieldMissing };
            }
            else if (!this.childIs('version', 'string')) {
                yield { message: (0, i18n_1.i) `version should be of type 'string', found '${this.kind('version')}'`, range: this.sourcePosition('version'), category: error_kind_1.ErrorKind.IncorrectType };
            }
            if (this.childIs('summary', 'string') === false) {
                yield { message: (0, i18n_1.i) `summary should be of type 'string', found '${this.kind('summary')}'`, range: this.sourcePosition('summary'), category: error_kind_1.ErrorKind.IncorrectType };
            }
            if (this.childIs('description', 'string') === false) {
                yield { message: (0, i18n_1.i) `description should be of type 'string', found '${this.kind('description')}'`, range: this.sourcePosition('description'), category: error_kind_1.ErrorKind.IncorrectType };
            }
            if (this.childIs('options', 'sequence') === false) {
                yield { message: (0, i18n_1.i) `options should be a sequence, found '${this.kind('options')}'`, range: this.sourcePosition('options'), category: error_kind_1.ErrorKind.IncorrectType };
            }
        }
        if (this.document.has('contacts')) {
            for (const each of this.contacts.values) {
                yield* each.validate();
            }
        }
        const set = new Set();
        for (const [mediaQuery, demandBlock] of this.conditionalDemands) {
            if (set.has(mediaQuery)) {
                yield { message: (0, i18n_1.i) `Duplicate keys detected in manifest: '${mediaQuery}'`, range: demandBlock, category: error_kind_1.ErrorKind.DuplicateKey };
            }
            set.add(mediaQuery);
            yield* demandBlock.validate();
        }
        yield* this.conditionalDemands.validate();
        yield* this.install.validate();
        yield* this.registries.validate();
        yield* this.contacts.validate();
        yield* this.exports.validate();
        yield* this.requires.validate();
    }
    normalize() {
        if (!this.node) {
            return;
        }
        if (this.document.has('info')) {
            this.setMember('id', this.#info.id);
            this.setMember('version', this.#info.version);
            this.setMember('summary', this.#info.summary);
            this.setMember('description', this.#info.description);
            const maybeOptions = this.#info.options.node?.items;
            if (maybeOptions) {
                for (const option of maybeOptions) {
                    this.#options.set(option.value, true);
                }
            }
            this.setMember('priority', this.#info.priority);
            this.node.delete('info');
        }
    }
    /** @internal */ assert(recreateIfDisposed = false, node = this.node) {
        if (!(0, yaml_1.isMap)(this.node)) {
            this.document = (0, yaml_1.parseDocument)('{}\n', { prettyErrors: false, lineCounter: this.lineCounter, strict: true });
            this.node = this.document.contents;
        }
    }
}
exports.MetadataFile = MetadataFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJhbWYvbWV0YWRhdGEtZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLCtCQUErQjtBQUMvQiwrQkFBNEU7QUFDNUUsa0NBQTRCO0FBQzVCLHlEQUFxRDtBQUlyRCw2Q0FBMEM7QUFDMUMsNkNBQTBDO0FBRzFDLHVDQUFxQztBQUNyQyx1Q0FBaUQ7QUFDakQsaUNBQThCO0FBQzlCLDZDQUFxRDtBQUVyRCxNQUFhLFlBQWEsU0FBUSxpQkFBTztJQUNUO0lBQTJDO0lBQWtDO0lBQWtCO0lBQTBDO0lBQXZLLFlBQThCLFFBQXlCLEVBQWtCLFFBQWdCLEVBQWtCLElBQVMsRUFBUyxXQUF3QixFQUFrQixXQUE0QjtRQUNqTSxLQUFLLENBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUR4QixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUFrQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQWtCLFNBQUksR0FBSixJQUFJLENBQUs7UUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFrQixnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7SUFHbk0sQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCLEVBQUUsR0FBUSxFQUFFLE9BQWdCLEVBQUUsV0FBaUI7UUFDeEYsT0FBTyxZQUFZLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLE9BQWUsRUFBRSxPQUFnQixF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
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 0BaF5S7XsolItjjgYFOG1KDqMK62Q10HzcczfZZGxNig
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC9oYV7CtNgLJs/
// SIG // 5RDSIbxjWtUSymBWPp17v+uUaZLM9TBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACEMaojFjt+mRWEb/XX+32hRNLaUB/kM
// SIG // 7W3pOYpHIp1aFFF8ffxWDgqJwjXYAIdM0YrRbNffMB3a
// SIG // 1nJVCgDeXpQi1whao1304KVb+wNTZDB3HG6llHJGvo9R
// SIG // 72LJM/e1Kj59rAfwfk4J5VvJ+Mp23BnKFp7jR7gn/kf2
// SIG // oSMRHkmeXebICTd7ciE0kxohKcC5VT9f6cj0A1p2uoio
// SIG // m3ezrRpNwfpffnPPoDpDLQBWzsMn19SL7iQ/9uOuEHhM
// SIG // 0bZtVsK8/uHuhW0TK+KVwksOhKWa+V5oAwLVdN/8003P
// SIG // 8uAQ6l0ONi4zrYVUVrjWXLaLpmZZI1yGZRXJO5id9syh
// SIG // T7WhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // cvhCrIk+bWnUq/WvigLHuLDxp1127eKpI64Deoz/SQ4C
// SIG // BmffBlof/BgTMjAyNTA0MDExOTU5MzQuMjA5WjAEgAIB
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
// SIG // hkiG9w0BAQsFAAIFAOuWswowIhgPMjAyNTA0MDExODQ2
// SIG // MzRaGA8yMDI1MDQwMjE4NDYzNFowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65azCgIBADAHAgEAAgIObTAHAgEA
// SIG // AgITazAKAgUA65gEigIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQAKh25fkUT2
// SIG // zyj7OO2WY++MlQGiKP/wRxfi1xPcXUXKskIJQgffH0wa
// SIG // TFkqkICy9kTCUEaZ++0f8aw8JV68/Vm090ssDsOS0Ecz
// SIG // IFNM4HxQyliYsVBe4k7W23eMLyiQLQhO/cfgHw7AhKie
// SIG // oaBHuLwokmACNYwBv1C1hGP0jZjF7dpG4hptdIwKL3yj
// SIG // 8VaLPVwdHUSdNU9mqfIV/rSU2qWCBz5jYHDvQ5eD239P
// SIG // 8p6fwnul0S/26Lmn8oU1Cv17H3vdfJHtcTvsiljCuiWM
// SIG // UyanyNTZUaCOd1oAjdPCTOoAfHadvpHhekOTuVjZzVdI
// SIG // V1OYvqyyezmPUlaER2YM8xEZMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAID
// SIG // ux5cADhsdMoAAQAAAgMwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgODE/jNJo+5CNF3PasuL9BtH2bMl4
// SIG // +DkHupEWfxncJm8wgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBLA90bcZb2k8RTmWZ6UMNA5LD5lXbqOUsi
// SIG // vYfcPvoTLTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACA7seXAA4bHTKAAEAAAIDMCIE
// SIG // ICN1ABd6pHdToyeKn/S1CviiP0de1xws19SOpzNXXaGu
// SIG // MA0GCSqGSIb3DQEBCwUABIICADLy0AeVL0DiynUAW/+d
// SIG // nFPzkOjFC9jp2K4BOycy6AaCSoILdAB00vSxcJjqzVm+
// SIG // xOB2mAtOm3CV16vOTvPaoJvjH/tkEV4GuIkGF97LHeZt
// SIG // AkNEgTdSDH1zPEbu6CV49I/rpQ5Chra4nXDmB8tz7hQl
// SIG // WAS8oQw/zvZlZ8CsU8JHMxJGHX59byJwqVguIoYgtaNP
// SIG // N9xHvDc+zl+YWkZViSNclA1pSJmID/Lb0BwMA7imrRTc
// SIG // 2tV5T7dSesBUNh3IIVjjZB8FK+BgvRDWIgrON0NB+3Ne
// SIG // RUpkO9pY6+sCfrdHKrlQw4drGZwxkMoD/xMvxsmYhPb5
// SIG // kqlDNNhJ2/z5dXJU7JB0sYTNExVLE6s2mZuF2amFMCZe
// SIG // dLie/euACmnKr8ESSIyvRi9YhJxxKDrCMqeZAG3Q5C4m
// SIG // qToZ0RRuuMcKdUR1dcfuOz8aU4XH7RSD69JHHHjXGwY9
// SIG // MxbputHMwFkvml4P2vz64uO5BNGx3KHprq3czmoZXiKy
// SIG // wH2jhnw/fovLPlQxD3csJO4cyZmRFgujU+zJa/UsgN2X
// SIG // 6XnCbQbRaylB762Tpy7eqf0ETJ0AWQdUGqlq3jEIBBph
// SIG // 2Ox4zrvrShZ6LdcwoYhu+d2u/d8YqzlPEQM/JdU2AQ6z
// SIG // jQq9im8hrWUn8O9f2Zd4+C4ywZ+O8XBOVmu+2oivvyIE
// SIG // OEn6
// SIG // End signature block
