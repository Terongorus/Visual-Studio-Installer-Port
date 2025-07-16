"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryResolver = exports.RegistryDatabase = exports.getArtifact = void 0;
const assert_1 = require("assert");
const artifact_1 = require("../artifacts/artifact");
const format_1 = require("../cli/format");
const i18n_1 = require("../i18n");
const LocalRegistry_1 = require("./LocalRegistry");
const RemoteRegistry_1 = require("./RemoteRegistry");
/**
  * returns an artifact for the strongly-named artifact id/version.
  */
async function getArtifact(registry, idOrShortName, version) {
    const artifactRecords = await registry.search({ idOrShortName, version });
    if (artifactRecords.length === 0) {
        return undefined; // nothing matched.
    }
    if (artifactRecords.length === 1) {
        // found 1 matching artifact identity
        const artifactRecord = artifactRecords[0];
        const artifactDisplay = artifactRecord[0];
        const artifactVersions = artifactRecord[1];
        if (artifactVersions.length === 0) {
            throw new Error('Internal search error: id matched but no versions present');
        }
        return [artifactDisplay, artifactVersions[0]];
    }
    // multiple matches.
    // we can't return a single artifact, we're going to have to throw.
    (0, assert_1.fail)((0, i18n_1.i) `'${idOrShortName}' matched more than one result (${[...artifactRecords.map(each => each[0])].join(',')}).`);
}
exports.getArtifact = getArtifact;
class RegistryDatabase {
    #uriToRegistry = new Map();
    getRegistryByUri(registryUri) {
        return this.#uriToRegistry.get(registryUri);
    }
    has(registryUri) { return this.#uriToRegistry.has(registryUri); }
    // Exposed for testing
    add(uri, registry) {
        const stringized = uri.toString();
        if (this.#uriToRegistry.has(stringized)) {
            throw new Error(`Duplicate registry add ${stringized}`);
        }
        this.#uriToRegistry.set(stringized, registry);
    }
    async loadRegistry(session, locationUri) {
        const locationUriStr = locationUri.toString();
        const existingRegistry = this.#uriToRegistry.get(locationUriStr);
        if (existingRegistry) {
            return existingRegistry;
        }
        // not already loaded
        let loaded;
        switch (locationUri.scheme) {
            case 'https':
                loaded = new RemoteRegistry_1.RemoteRegistry(session, locationUri);
                break;
            case 'file':
                loaded = new LocalRegistry_1.LocalRegistry(session, locationUri);
                break;
            default:
                throw new Error((0, i18n_1.i) `Unsupported registry scheme '${locationUri.scheme}'`);
        }
        this.#uriToRegistry.set(locationUriStr, loaded);
        await loaded.load();
        return loaded;
    }
    getAllUris() {
        return Array.from(this.#uriToRegistry.keys());
    }
}
exports.RegistryDatabase = RegistryDatabase;
class RegistryResolver {
    #database;
    #knownUris;
    #uriToName;
    #nameToUri;
    addMapping(name, uri) {
        this.#uriToName.set(uri, name);
        this.#nameToUri.set(name, uri);
    }
    constructor(parent) {
        if (parent instanceof RegistryResolver) {
            this.#database = parent.#database;
            this.#knownUris = new Set(parent.#knownUris);
            this.#uriToName = new Map(parent.#uriToName);
            this.#nameToUri = new Map(parent.#nameToUri);
        }
        else {
            this.#database = parent;
            this.#knownUris = new Set();
            this.#uriToName = new Map();
            this.#nameToUri = new Map();
        }
    }
    getRegistryName(registry) {
        const stringized = registry.toString();
        return this.#uriToName.get(stringized);
    }
    getRegistryDisplayName(registry) {
        const stringized = registry.toString();
        const prettyName = this.#uriToName.get(stringized);
        if (prettyName) {
            return prettyName;
        }
        return `[${stringized}]`;
    }
    getRegistryByUri(registryUri) {
        const stringized = registryUri.toString();
        if (this.#knownUris.has(stringized)) {
            return this.#database.getRegistryByUri(stringized);
        }
        return undefined;
    }
    getRegistryByName(name) {
        const asUri = this.#nameToUri.get(name);
        if (asUri) {
            return this.#database.getRegistryByUri(asUri);
        }
        return undefined;
    }
    // Adds `registry` to this context with name `name`. If `name` is already set to a different URI, throws.
    add(registryUri, name) {
        const stringized = registryUri.toString();
        if (!this.#database.has(stringized)) {
            throw new Error('Attempted to add unloaded registry to a RegistryContext');
        }
        const oldLocation = this.#nameToUri.get(name);
        if (oldLocation && oldLocation !== stringized) {
            throw new Error((0, i18n_1.i) `Tried to add ${stringized} as ${name}, but ${name} is already ${oldLocation}.`);
        }
        this.#knownUris.add(stringized);
        this.addMapping(name, stringized);
    }
    async search(criteria) {
        const idOrShortName = criteria?.idOrShortName || '';
        const [source, name] = (0, artifact_1.parseArtifactDependency)(idOrShortName);
        if (source === undefined) {
            // search them all
            const results = [];
            for (const location of this.#knownUris) {
                const registry = this.#database.getRegistryByUri(location);
                if (registry === undefined) {
                    throw new Error('RegistryContext tried to search an unloaded registry.');
                }
                const displayName = this.getRegistryDisplayName(registry.location);
                for (const [artifactId, artifacts] of await registry.search(criteria)) {
                    results.push([(0, format_1.artifactIdentity)(displayName, artifactId, artifacts[0].shortName), artifacts]);
                }
            }
            return results;
        }
        else {
            const registry = this.getRegistryByName(source);
            if (registry) {
                return (await registry.search({ ...criteria, idOrShortName: name }))
                    .map((artifactRecord) => [(0, format_1.artifactIdentity)(source, artifactRecord[0], artifactRecord[1][0].shortName), artifactRecord[1]]);
            }
            throw new Error((0, i18n_1.i) `Unknown registry ${source} (in ${idOrShortName}). The following are known: ${Array.from(this.#nameToUri.keys()).join(', ')}`);
        }
    }
    // Combines resolvers together. Any registries that match exactly will take their names from `otherResolver`. Any
    // registries whose names match but which resolve to different URIs will have the name from `otherResolver`, and the
    // other registry will become known but nameless.
    with(otherResolver) {
        if (this.#database !== otherResolver.#database) {
            throw new Error('Tried to combine registry resolvers with different databases.');
        }
        const result = new RegistryResolver(otherResolver);
        for (const uri of this.#knownUris) {
            result.#knownUris.add(uri);
        }
        for (const [name, location] of this.#nameToUri) {
            if (!result.#nameToUri.has(name) && !result.#uriToName.has(location)) {
                result.addMapping(name, location);
            }
        }
        return result;
    }
}
exports.RegistryResolver = RegistryResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cmllcy5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJyZWdpc3RyaWVzL3JlZ2lzdHJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUVsQyxtQ0FBOEI7QUFDOUIsb0RBQTBFO0FBQzFFLDBDQUFpRDtBQUNqRCxrQ0FBNEI7QUFHNUIsbURBQWdEO0FBQ2hELHFEQUFrRDtBQXdCbEQ7O0lBRUk7QUFDRyxLQUFLLFVBQVUsV0FBVyxDQUFDLFFBQTRCLEVBQUUsYUFBcUIsRUFBRSxPQUEyQjtJQUNoSCxNQUFNLGVBQWUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMxRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ2hDLE9BQU8sU0FBUyxDQUFDLENBQUMsbUJBQW1CO0tBQ3RDO0lBRUQsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNoQyxxQ0FBcUM7UUFDckMsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1NBQzlFO1FBRUQsT0FBTyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsb0JBQW9CO0lBQ3BCLG1FQUFtRTtJQUNu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
// SIG // Begin signature block
// SIG // MIIoUAYJKoZIhvcNAQcCoIIoQTCCKD0CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // H2AhjPPo5n+RwXCSLBrO2FXIHByom2MTdh+Gd5LI2M2g
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
// SIG // ghojMIIaHwIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCD3ym3FtdNxzWPJ
// SIG // i2XPidk7b5R8gZufy+QPdneFfq0NPzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAEhkVn21Jpu9awaorBKzxPFACawDkWA0
// SIG // gmr2+CT7aWOgKLK3ZlbDiElArzIwbpby7cUldWV2P0n6
// SIG // mhlJpwp3pEJ54qTEc/m3mK0q6KwdTzmCD6ApZizbDR1z
// SIG // qjm7tDh8wQR+ljktih5EiedJtiK5Ej2AgegwUw63KnTo
// SIG // a4YgSbGNrEGpcJUsdfCulnOYvwcsB5pJ48Xi0JxPHY5c
// SIG // 05dsfe9kgK2OFMoO2CSyf3TvdiRt1zACvUVv09KtNPpc
// SIG // fxHvO2unBm1lvjX05lxA+D6kRPFlF/uCvvqazESootES
// SIG // CgvfPK9gt/k2bWXAhNrNHJH2b38G1oVHKLFCkPxqXQht
// SIG // 8dahghetMIIXqQYKKwYBBAGCNwMDATGCF5kwgheVBgkq
// SIG // hkiG9w0BBwKggheGMIIXggIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // 16bfUDxqUyHGKdIxoXJAiIHErs4qkAAGBVUr0ojQQdkC
// SIG // Bme2Ity9zBgTMjAyNTA0MDExOTU5MjkuMDE3WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NEMxQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH7MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAf8SOHz3wWXWoQABAAAB/zANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMTlaFw0yNTEwMjIxODMx
// SIG // MTlaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo0
// SIG // QzFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBAMnoldKQe24PP6nP5pIg
// SIG // 3SV58yVj2IJPZkxniN6c0KbMq0SURFnCmB3f/XW/oN8+
// SIG // HVOFQpAGRF6r5MT+UDU7QRuSKXsaaYeD4W4iSsL1/lEu
// SIG // CpEhYX9cH5QwGNbbvQkKoYcXxxVe74bZqhywgpg8YWT5
// SIG // ggYff13xSUCFMFWUfEbVJIM5jfW5lomIH19EfmwwJ53F
// SIG // HbadcYxpgqXQTMoJPytId21E1M0B2+JD39spZCj6FhWJ
// SIG // 9hjWIFsPDxgVDtL0zCo2A+qS3gT9IWQ4eT93+MYRi5us
// SIG // ffMbiEKf0RZ8wW4LYcklxpfjU9XGQKhshIU+y9EnUe6k
// SIG // Jb+acAzXq2yt2EhAypN7A4fUutISyTaj+9YhypBte+Rw
// SIG // MoOs5hOad3zja/f3yBKTwJQvGIrMV2hl+EaQwWFSqRo9
// SIG // BQmcIrImbMZtF/cOmUpPDjl3/CcU2FiKn0bls3VIq9Gd
// SIG // 44jjrWg6u13cqQeIGa4a/dCnD0w0cL8utM60HGv9Q9Se
// SIG // z0CQCTm24mm6ItdrrFfGsbZU/3QnjwuJ3XBXGq9b/n5w
// SIG // pYbPbtxZ+i5Bw0WXzc4V4CwxMG+nQOMt7OhvoEN+aPdI
// SIG // 9oumpmmvCbFf3Ahfog0hswMWWNbENZq3TJs8X1s1zerD
// SIG // yTMuPbXbFkyIGVlTkkvblB4UmJG4DMZy3oil3geTAfUD
// SIG // HDknAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUw/qV5P60
// SIG // /3exP9EBO4R9MM/ulGEwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBADkj
// SIG // TeTKS4srp5vOun61iItIXWsyjS4Ead1mT34WIDwtyvwz
// SIG // TMy5YmEFAKelrYKJSK2rYr14zhtZSI2shva+nsOB9Z+V
// SIG // 2XQ3yddgy46KWqeXtYlP2JNHrrT8nzonr327CM05Pxud
// SIG // frolCZO+9p1c2ruoSNihshgSTrwGwFRUdIPKaWcC4IU+
// SIG // M95pBmY6vzuGfz3JlRrYxqbNkwrSOK2YzzVvDuHP+GiU
// SIG // ZmEPzXVvdSUazl0acl60ylD3t5DfDeeo6ZfZKLS4Xb3f
// SIG // PUWzrCTX9l86mwFe141eHGgoJQNm7cw8XMn38F4S7vRz
// SIG // FN3S2EwCPdYEzVBewQPatRL0pQiipTfDddGOIlNJ8iJH
// SIG // 6UcWMgG0cquUD2DyRxgNE8tDw/N2gre/UWtCHQyDErsF
// SIG // 5aVJ8iMscKw8pYHzhssrFgcEP47NuPW6kDmD3acjnYEX
// SIG // vLV3Rq4A6AXrlTivnEQpV6YpjWMK+taGdv5DzM1a80VG
// SIG // DJAV3vVqnUns4fLcrbrpWGHESveaooRdIq0LOv1jkCZb
// SIG // UF+/ZcxVxPRRZZ/TIsdGrPguBz83fktGwTdwN10UTsAL
// SIG // 9NeiArk/IWNSJ8lu48FZjfjpENc3ouui61OUbQM9J08c
// SIG // eTnj8o502iLU0mODhrhlNUl2h+PSUj97fMhmAP76K21u
// SIG // FZ3ng+9tRYMGiU6BxZDiMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCA1YwggI+AgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NEMxQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAKkT
// SIG // jGzEvCXFJXJz5MESxUT1xbKZoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlquTMCIYDzIwMjUwNDAxMTgxNDQzWhgPMjAy
// SIG // NTA0MDIxODE0NDNaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAOuWq5MCAQAwBwIBAAICAcYwBwIBAAICE+swCgIF
// SIG // AOuX/RMCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAQEAejWazvNzZeA8dmc5Gl7h
// SIG // ffs7Du67IcGnFaOPHmlxU44/gXaklYr6OtRXlYWZET2h
// SIG // hB+ZY+bswCqwZQNmoKnXS0npW+6eYL7JMoWSnBOMVkrK
// SIG // 1wuDkDIUlR5oYiQ1fu/Pq6C8qh3y/xTUPahrM1i0GAzc
// SIG // kqs7dAkMdkTI18qGRLfMtulO+ZI+Jd3i/Rc622Izzb0H
// SIG // y4cbGdaTBsIvqhIY0SguWmNQFQ8y2u0fbajIxNWI/ksA
// SIG // nuHEMgLOOxPKmUwcjF9q1KmGJZe6c1axmT6vFi3eM1hx
// SIG // 8YYO3juPNGN5rbCARTGeLJVVUgwFCf/Hoe4vxmc1mneW
// SIG // /xJAOa28Idj7EDGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB/xI4fPfBZdah
// SIG // AAEAAAH/MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIFrAVR/JEUj3IpX+eifa5P/UUxM0W9UIz2il0DE6
// SIG // jKNvMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // 5DLvvskCd2msnCLjE+rwOyTbjGlTiN6g40hFfLqcp/0w
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAf8SOHz3wWXWoQABAAAB/zAiBCCIYTctOfRC
// SIG // hkZhf3jHHdHfIbTiRJtlTPy1I7ZBRDLIoDANBgkqhkiG
// SIG // 9w0BAQsFAASCAgDEyz97Jst422uoedvRln3bRf0qhzTZ
// SIG // wjhCRtYK5sOCx23xaUFqsYHFrMZ4jkEx4mgU1XA1KjdE
// SIG // 1CrZa5gfmST0vH+zx6lUSzJ9fJ+5jIvOZ/NtI2pnhAD7
// SIG // +mX2Vxt4pQtZNaHXsLrOaj4qu1WuaMTqk+7Na7xflDeW
// SIG // n7GF08cAsmA1FZCFxuK8LLojdQqsl+VJvs4WYpKJW8mk
// SIG // SQmtIl+4M8lgYnTGWkOQnEQnFNbU9h4cttGMLWNNerUF
// SIG // 4Rt4ghiAp5KxLMSPkF+TsyZFXY74vE9tludU5pRNev3V
// SIG // H5+Leq8K2myY9XdzH6jSULNkIn4rik+nwdbC7HPgolOG
// SIG // 7ziAerwbrA6duw3CYF5148GbFUpGT6wmPwWxP864kPan
// SIG // ujmv7AT0hlZfOo7jW75bBDpGSkrhr7qhltz54eRIQDS7
// SIG // becqLSVbpDPZ1YiCPXc8r0/0A2KNRzV1/+UXW0vbOAGf
// SIG // 781SPaVS0MVrFLrf0c/L+3VExnSbUzY3hlRIPpBFkAQL
// SIG // Vp3QWQx8bE3/yh+PCVsHyfdvRQkL5lRXzOP0KACOisAH
// SIG // n/vbDzrk0PuxOM4tsWxkbAuEQsr/IR0jfBEZ0pf7QUrH
// SIG // Ejl09NIt28HHxyYs3EujBIRwSalcNsF0655dmvKfFv91
// SIG // yit3Lx2MnDiZRQyQVF+OypGU66lE5bJVWBsVMw==
// SIG // End signature block
