"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yaml = exports.YAMLScalar = exports.YAMLSequence = exports.YAMLDictionary = void 0;
const yaml_1 = require("yaml");
const error_kind_1 = require("../interfaces/error-kind");
const checks_1 = require("../util/checks");
class YAMLDictionary extends yaml_1.YAMLMap {
}
exports.YAMLDictionary = YAMLDictionary;
class YAMLSequence extends yaml_1.YAMLSeq {
}
exports.YAMLSequence = YAMLSequence;
class YAMLScalar extends yaml_1.Scalar {
}
exports.YAMLScalar = YAMLScalar;
class Yaml {
    parent;
    key;
    constructor(/** @internal */ node, parent, key) {
        this.parent = parent;
        this.key = key;
        this.node = node;
        if (!(this.constructor).create) {
            throw new Error(`class ${this.constructor.name} is missing implementation for create`);
        }
    }
    get fullName() {
        return !this.node ? '' : this.parent ? this.key ? `${this.parent.fullName}.${this.key}` : this.parent.fullName : this.key || '$';
    }
    /** returns the current node as a JSON string */
    toString() {
        return this.node?.toJSON() ?? '';
    }
    get keys() {
        return this.exists() && (0, yaml_1.isMap)(this.node) ? this.node.items.map(each => this.asString(each.key)) : [];
    }
    /**
     * Coercion function to string
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asString(value) {
        if (this.parent) {
            return this.parent.asString(value);
        }
        return value === undefined ? undefined : ((0, yaml_1.isScalar)(value) ? value.value : value).toString();
    }
    /**
     * Coercion function to number
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asNumber(value) {
        if (this.parent) {
            return this.parent.asNumber(value);
        }
        if ((0, yaml_1.isScalar)(value)) {
            value = value.value;
        }
        return typeof value === 'number' ? value : undefined;
    }
    /**
     * Coercion function to boolean
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asBoolean(value) {
        if (this.parent) {
            return this.parent.asBoolean(value);
        }
        if ((0, yaml_1.isScalar)(value)) {
            value = value.value;
        }
        return typeof value === 'boolean' ? value : undefined;
    }
    /**
     * Coercion function to any primitive
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asPrimitive(value) {
        if (this.parent) {
            return this.parent.asPrimitive(value);
        }
        if ((0, yaml_1.isScalar)(value)) {
            value = value.value;
        }
        switch (typeof value) {
            case 'boolean':
            case 'number':
            case 'string':
                return value;
        }
        return undefined;
    }
    get root() {
        return this.parent ? this.parent.root : this;
    }
    createNode() {
        return this.constructor.create();
    }
    /**@internal*/ static create() {
        throw new Error('creator not Not implemented on base class.');
    }
    _node;
    get node() {
        if (this._node) {
            return this._node;
        }
        if (this.key && this.parent && (0, yaml_1.isMap)(this.parent?.node)) {
            this._node = this.parent.node.get(this.key, true);
        }
        return this._node;
    }
    set node(n) {
        this._node = n;
    }
    sourcePosition(key) {
        if (!this.node) {
            return undefined;
        }
        if (key !== undefined) {
            if (((0, yaml_1.isMap)(this.node) || (0, yaml_1.isSeq)(this.node))) {
                const node = this.node.get(key, true);
                if (node) {
                    return node.range || undefined;
                }
                return undefined;
            }
            if ((0, yaml_1.isScalar)(this.node)) {
                throw new Error('Scalar does not have a key to get a source position');
            }
        }
        return this.node?.range || undefined;
    }
    /** will dispose of this object if it is empty (or forced) */
    dispose(force = false, deleteFromParent = true) {
        if ((this.empty || force) && this.node) {
            if (deleteFromParent) {
                this.parent?.deleteChild(this);
            }
            this.node = undefined;
        }
    }
    /** if this node has any data, this should return false */
    get empty() {
        if ((0, yaml_1.isCollection)(this.node)) {
            return !(this.node?.items.length);
        }
        else if ((0, yaml_1.isScalar)(this.node)) {
            return !(0, checks_1.isNullish)(this.node.value);
        }
        return false;
    }
    /** @internal */ exists() {
        if (this.node) {
            return true;
        }
        // well, if we're lazy and haven't instantiated it yet, check if it's created.
        if (this.key && this.parent && (0, yaml_1.isMap)(this.parent.node)) {
            this.node = this.parent.node.get(this.key);
            if (this.node) {
                return true;
            }
        }
        return false;
    }
    /** @internal */ assert(recreateIfDisposed = false, node = this.node) {
        if (this.node && this.node === node) {
            return; // quick and fast
        }
        if (recreateIfDisposed) {
            // ensure that this node is the node we're supposed to be.
            this.node = node;
            if (this.parent) {
                // ensure that the parent is not disposed
                this.parent.assert(true);
                if ((0, yaml_1.isMap)(this.parent.node)) {
                    if (this.key) {
                        // we have a parent, and the key, we can add the node.
                        // let's just check if there is one first
                        this.node = this.node || this.parent.node.get(this.key) || this.createNode();
                        this.parent.node.set(this.key, this.node);
                        return;
                    }
                    // the parent is a map, but we don't have a key, so we can't add the node.
                    throw new Error('Parent is a map, but we don\'t have a key');
                }
                if ((0, yaml_1.isSeq)(this.parent.node)) {
                    this.node = this.node || this.parent.node.get(this.key) || this.createNode();
                    this.parent.node.add(this.node);
                    return;
                }
                throw new Error('YAML parent is not a container.');
            }
        }
        throw new Error('YAML node is undefined');
    }
    deleteChild(child) {
        if (!child.node) {
            // this child is already disposed
            return;
        }
        this.assert();
        const node = this.node;
        if ((0, yaml_1.isMap)(node)) {
            if (child.key) {
                node.delete(child.key);
                child.dispose(true, false);
                this.dispose(); // clean up if this is empty
                return;
            }
        }
        if ((0, yaml_1.isSeq)(node)) {
            // child is in some kind of collection.
            // we should be able to find the child's index and remove it.
            const items = node.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i] === child.node) {
                    node.delete(i);
                    child.dispose(true, false);
                    this.dispose(); // clean up if this is empty
                    return;
                }
            }
            // if we get here, we didn't find the child.
            // but, it's not in the object, so we're good I guess
            throw new Error('Child Node not found trying to delete');
            // return;
        }
        throw new Error('this node does not have children.');
    }
    *validate() {
        // shh.
    }
    *validateChildKeys(keys) {
        if ((0, yaml_1.isMap)(this.node)) {
            for (const key of this.keys) {
                if (keys.indexOf(key) === -1) {
                    yield {
                        message: `Unexpected '${key}' found in ${this.fullName}`,
                        range: this.sourcePosition(key),
                        category: error_kind_1.ErrorKind.InvalidChild,
                    };
                }
            }
        }
    }
    *validateIsObject() {
        if (this.node && !(0, yaml_1.isMap)(this.node)) {
            yield {
                message: `'${this.fullName}' is not an object`,
                range: this,
                category: error_kind_1.ErrorKind.IncorrectType
            };
        }
    }
    *validateIsSequence() {
        if (this.node && !(0, yaml_1.isSeq)(this.node)) {
            yield {
                message: `'${this.fullName}' is not an object`,
                range: this,
                category: error_kind_1.ErrorKind.IncorrectType
            };
        }
    }
    *validateIsSequenceOrPrimitive() {
        if (this.node && (!(0, yaml_1.isSeq)(this.node) && !(0, yaml_1.isScalar)(this.node))) {
            yield {
                message: `'${this.fullName}' is not a sequence or value`,
                range: this,
                category: error_kind_1.ErrorKind.IncorrectType
            };
        }
    }
    *validateIsObjectOrPrimitive() {
        if (this.node && (!(0, yaml_1.isMap)(this.node) && !(0, yaml_1.isScalar)(this.node))) {
            yield {
                message: `'${this.fullName}' is not an object or value`,
                range: this,
                category: error_kind_1.ErrorKind.IncorrectType
            };
        }
    }
    *validateChild(child, kind) {
        if (this.node && (0, yaml_1.isMap)(this.node)) {
            if (this.node.has(child)) {
                const c = this.node.get(child, true);
                if (!(0, yaml_1.isScalar)(c) || typeof c.value !== kind) {
                    yield {
                        message: `'${this.fullName}.${child}' is not a ${kind} value`,
                        range: c.range,
                        category: error_kind_1.ErrorKind.IncorrectType
                    };
                }
            }
        }
    }
}
exports.Yaml = Yaml;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC10eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJ5YW1sL3lhbWwtdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUVsQywrQkFBc0Y7QUFDdEYseURBQXFEO0FBRXJELDJDQUEyQztBQUUzQyxNQUFhLGNBQWUsU0FBUSxjQUFvQjtDQUFJO0FBQTVELHdDQUE0RDtBQUM1RCxNQUFhLFlBQWEsU0FBUSxjQUFZO0NBQUk7QUFBbEQsb0NBQWtEO0FBQ2xELE1BQWEsVUFBVyxTQUFRLGFBQVc7Q0FBSTtBQUEvQyxnQ0FBK0M7QUFLL0MsTUFBdUMsSUFBSTtJQUNlO0lBQStCO0lBQXZGLFlBQVksZ0JBQWdCLENBQUMsSUFBZSxFQUFZLE1BQW1CLEVBQVksR0FBWTtRQUEzQyxXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQVksUUFBRyxHQUFILEdBQUcsQ0FBUztRQUNqRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDLE1BQU0sRUFBRTtZQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHVDQUF1QyxDQUFDLENBQUM7U0FDeEY7SUFDSCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxD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
// SIG // Begin signature block
// SIG // MIIoNgYJKoZIhvcNAQcCoIIoJzCCKCMCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // h8bWcruBEJhlu6+dUorHMSn/LRCR8uRNHwmgx+r+iDOg
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
// SIG // ghoJMIIaBQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCEQEUMoy9gEVBA
// SIG // f7TbNVuhFRnBkHO4UERENKJuN4flSTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAIpnJ4GHm5wEDDvLBCH+t3rbywQ67Xly
// SIG // AnVjz2VIaFXI/ZG0cPlknIF8r1DoIr0Nl83MkY/e7DLi
// SIG // CzJ2nY4Qip0Xc1A9zYxEezRwI13UbVdL7Urmn7DT1drM
// SIG // LaCTC0duhfKAhyV0kKDJ+q7GsbtL07eMgzAGd2Xnq8mJ
// SIG // KZ83dexB/BaYYp+EK9iuVModHywn80zMY4pAIRkX3EXc
// SIG // FRTO+sCqOnUrdId/efJ7MOxTqGVUn+Js8KKlpghI5BqT
// SIG // RCQKn9VRymM2stHLX5Kx/a5DP0kA7xXKzlsuqXaktKEp
// SIG // dZBZ+En2Q0aq2cDTo5stIzQO9IdI038L7qo/dDO+2wVG
// SIG // Bv6hgheTMIIXjwYKKwYBBAGCNwMDATGCF38wghd7Bgkq
// SIG // hkiG9w0BBwKgghdsMIIXaAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUQYLKoZIhvcNAQkQAQSgggFABIIBPDCCATgC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // 1/jz/Tw+39VRoHoUMBjkQ7pvxQ3PNc3YzM2ItAO59nMC
// SIG // BmfcbVMyWBgSMjAyNTA0MDExOTU5MTYuNjdaMASAAgH0
// SIG // oIHRpIHOMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046RTAwMi0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghHqMIIHIDCCBQigAwIBAgIT
// SIG // MwAAAgsRnVYpkvm/hQABAAACCzANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // NTAxMzAxOTQyNThaFw0yNjA0MjIxOTQyNThaMIHLMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3Nv
// SIG // ZnQgQW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5u
// SIG // U2hpZWxkIFRTUyBFU046RTAwMi0wNUUwLUQ5NDcxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCqrPitRjAXqFh2IHzQYD3uykDPyJF+79e5CkY4aYsb
// SIG // 93QVun4fZ3Ju/0WHrtAF3JswSiAVl7p1H2zFKrvyhaVu
// SIG // RYcSc7YuyP0GHEVq7YVS5uF3YLlLeoyGOPKSXGs6agW6
// SIG // 0CqVBhPQ+2n49e6YD9wGv6Y0HmBKmnQqY/AKJijgUiRu
// SIG // lb1ovNEcTZmTNRu1mY+0JjiEus+eF66VNoBv1a2MW0JP
// SIG // YbFBhPzFHlddFXcjf2qIkb5BYWsFL7QlBjXApf2HmNrP
// SIG // zG36g1ybo/KnRjSgIRpHeYXxBIaCEGtR1EmpJ90OSFHx
// SIG // Uu7eIjVfenqnVtag0yAQY7zEWSXMN6+CHjv3SBNtm5ZI
// SIG // RyyCsUZG8454K+865bw7FwuH8vk5Q+07K5lFY02eBDw3
// SIG // UKzWjWvqTp2pK8MTa4kozvlKgrSGp5sh57GnkjlvNvt7
// SIG // 8NXbZTVIrwS7xcIGjbvS/2r5lRDT+Q3P2tT+g6KDPdLn
// SIG // tlcbFdHuuzyJyx0WfCr8zHv8wGCB3qPObRXK4opAInSQ
// SIG // 4j5iS28KATJGwQabRueZvhvd9Od0wcFYOb4orUv1dD5X
// SIG // wFyKlGDPMcTPOQr0gxmEQVrLiJEoLyyW8EV/aDFUXTox
// SIG // yhfzWZ6Dc0l9eeth1Et2NQ3A/qBR5x33pjKdHJVJ5xpp
// SIG // 2AI3ZzNYLDCqO1lthz1GaSz+PQIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFGZcLIjfr+l6WeMuhE9gsxe98j/+MB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQCaKPVn6GLcnkbPEdM0R9q4Zm0+
// SIG // 7JfG05+pmqP6nA4SwT26k9HlJQjqw/+WkiQLD4owJxoo
// SIG // Ir9MDZbiZX6ypPhF+g1P5u8BOEXPYYkOWpzFGLRLtlZH
// SIG // vfxpqAIa7mjLGHDzKr/102AXaD4mGydEwaLGhUn9DBGd
// SIG // Mm5dhiisWAqb/LN4lm4OuX4YLqKcW/0yScHKgprGgLY+
// SIG // 6pqv0zPU74j7eCr+PDTNYM8tFJ/btUnBNLyOE4WZwBIq
// SIG // 4tnvXjd2cCOtgUnoQjFU1ZY7ZWdny3BJbf3hBrb3NB2I
// SIG // U4nu622tVrb1fNkwdvT501WRUBMd9oFf4xifj2j2Clbv
// SIG // 1XGljXmd6yJjvt+bBuvJLUuc9m+vMKOWyRwUdvOl/E5a
// SIG // 8zV3MrjCnY6fIrLQNzBOZ6klICPCi+2GqbViM0CI6CbZ
// SIG // ypei5Rr9hJbH8rZEzjaYWLnr/XPsU0wr2Tn6L9dJx2q/
// SIG // LAoK+oviAInj0aP4iRrMyUSO6KL2KwY6zJc6SDxbHkwY
// SIG // HdQRrPNP3SutMg6LgBSvtmfqwgaXIHkCoiUFEAz9cGIq
// SIG // vgjGpGppKTcTuoo3EEgp/zRd0wxW0QqmV3ygYGicen30
// SIG // KAWHrKFC8Sbwc6qC4podVZYJZmirHBP/uo7sQne5H0xt
// SIG // dvDmXDUfy5gNjLljQIUsJhQSyyXbSjSb2a5jhOUfxzCC
// SIG // B3EwggVZoAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUw
// SIG // DQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRp
// SIG // ZmljYXRlIEF1dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4
// SIG // MjIyNVoXDTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDk4aZM57RyIQt5osvXJHm9DtWC
// SIG // 0/3unAcH0qlsTnXIyjVX9gF/bErg4r25PhdgM/9cT8dm
// SIG // 95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNE
// SIG // t6aORmsHFPPFdvWGUNzBRMhxXFExN6AKOG6N7dcP2CZT
// SIG // fDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6GnszrYBbfowQ
// SIG // HJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5
// SIG // LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVV
// SIG // mG1oO5pGve2krnopN6zL64NF50ZuyjLVwIYwXE8s4mKy
// SIG // zbnijYjklqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpG
// SIG // dc3EXzTdEonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2
// SIG // TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZ
// SIG // fD9M269ewvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1q
// SIG // GFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSL
// SIG // W6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLU
// SIG // HMVr9lxSUV0S2yW6r1AFemzFER1y7435UsSFF5PAPBXb
// SIG // GjfHCBUYP3irRbb1Hode2o+eFnJpxq57t7c+auIurQID
// SIG // AQABo4IB3TCCAdkwEgYJKwYBBAGCNxUBBAUCAwEAATAj
// SIG // BgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8v
// SIG // BO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MFwGA1UdIARVMFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNV
// SIG // HSUEDDAKBggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4K
// SIG // AFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
// SIG // kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
// SIG // KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG9w0B
// SIG // AQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwU
// SIG // tj5OR2R4sQaTlz0xM7U518JxNj/aZGx80HU5bbsPMeTC
// SIG // j/ts0aGUGCLu6WZnOlNN3Zi6th542DYunKmCVgADsAW+
// SIG // iehp4LoJ7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhT
// SIG // dSRXud2f8449xvNo32X2pFaq95W2KFUn0CS9QKC/GbYS
// SIG // EhFdPSfgQJY4rPf5KYnDvBewVIVCs/wMnosZiefwC2qB
// SIG // woEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0
// SIG // DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxy
// SIG // bxCrdTDFNLB62FD+CljdQDzHVG2dY3RILLFORy3BFARx
// SIG // v2T5JL5zbcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+k
// SIG // KNxnGSgkujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2
// SIG // tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4
// SIG // O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokL
// SIG // jzbaukz5m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTm
// SIG // dHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/Z
// SIG // cGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggNNMIIC
// SIG // NQIBATCB+aGB0aSBzjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkUwMDItMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQCoQndUJN3Ppq2xh8RhtsR35NCZwaCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBCwUAAgUA65a8yzAiGA8yMDI1MDQwMTE5Mjgx
// SIG // MVoYDzIwMjUwNDAyMTkyODExWjB0MDoGCisGAQQBhFkK
// SIG // BAExLDAqMAoCBQDrlrzLAgEAMAcCAQACAhLJMAcCAQAC
// SIG // AhMuMAoCBQDrmA5LAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQELBQADggEBAH9Rpt4Q1NpF
// SIG // ZVypU0kAd9qdBRtSpuq2KapTMhH6AabFpu3eZgwiMH1Z
// SIG // 5CQDyy0Fp2Y+VviSZFnjZDXv7nYNZx69fY4XE/rK/W5Z
// SIG // qe89GyKnTfxmXzQ33xX3gI0Rl95YNhJXIzz3Gb5MgCWZ
// SIG // vnW2uI+n6hC+CXR70BJeobckYkFm80O7eaWmoopI3yN5
// SIG // TGCKT+od1gNJlSEu9koJYXkiUdmF9ff7tDaUkqqBY2iE
// SIG // iujlKAg9rxniu7eMFV8JljA8L7fKwwszGmBe3YTticCs
// SIG // 55vMZlwR2Rl7Oi4m1hiO/cdy1rliObGyvYnkO9r6yQu3
// SIG // EQCMg/6jNukdUOMASYoaZxwxggQNMIIECQIBATCBkzB8
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAgsR
// SIG // nVYpkvm/hQABAAACCzANBglghkgBZQMEAgEFAKCCAUow
// SIG // GgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqG
// SIG // SIb3DQEJBDEiBCB2jDXf3nLRuyqxq3/5zpxlaWln66xR
// SIG // DtFxVzW4QcWo3DCB+gYLKoZIhvcNAQkQAi8xgeowgecw
// SIG // geQwgb0EIDTVdKu6N77bh0wdOyF+ogRN8vKJcw5jnf2/
// SIG // EussYkozMIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTACEzMAAAILEZ1WKZL5v4UAAQAAAgswIgQg
// SIG // hxIMvbNk24/fZmFWxAG0o7Sg8jJ6gbrhXXyIP2/OgnQw
// SIG // DQYJKoZIhvcNAQELBQAEggIAlPMZuyPLgAUX1zo7HbS/
// SIG // 26O/ZMMBg7z65i6Nlho56+iMgNHsHUFIDBA58HU9FSby
// SIG // UtB7iwU7STVYkKx84RnPct/+zRZ/t44H6HuB0HH373st
// SIG // 1Si4fBDFaYxuSRABaGD05NodeO8tl2ZINAypZ06QKNHM
// SIG // DA359GpVHBNCI9PvNhUI1Se9M8VcSmKjxeN6Yi65Ck4E
// SIG // y2y8U7gFi1l1ZFYemAjuIU34ztW71bNgWEwlly62DL8F
// SIG // CdEoO8QT9RKT/lsOQggj1JBNlylXva2Wx7dideFL11oR
// SIG // gbt1uy0iy6I06O5lzbAgN8NVGH2vNoGiLD021TGlFATj
// SIG // 4bQf1pxcCuLbSm+eRt56+0gma5cShXjJYABToblcXlXT
// SIG // erm+2cAxc9eeNaG9hBWJx8eYNcPrgoG9wfS4zvYy3dzy
// SIG // b/wdTwpkmxbsyY13NVcd86FK1RIpZpIgVBo83enrC+1a
// SIG // c4t+RxodPLOui/3wxVl5kg4k1LrhhkoO3vc5dHT8RrkI
// SIG // cpohhlSlZtj8GMCvWYg99FUu6H3v1RW6f6EBxG4vM0iC
// SIG // mNYxAAt/kHzpzZxE5TXd7GdRuTjG2/5RW/4FJrNoWMVW
// SIG // 8xLGzk8bx7BDgsjxDPatudZiDV/rZgmNV6eXkb+UM1cU
// SIG // azHPnx2PppNEJyJvN3HpdqwP0s6Y/ianGLqD/LLuiEmcZNs=
// SIG // End signature block
