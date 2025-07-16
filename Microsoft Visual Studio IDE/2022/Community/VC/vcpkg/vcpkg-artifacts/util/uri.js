"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilePath = exports.Uri = void 0;
const assert_1 = require("assert");
const path_1 = require("path");
const url_1 = require("url");
const vscode_uri_1 = require("vscode-uri");
const hash_1 = require("./hash");
const text_1 = require("./text");
/**
 * This class is intended to be a drop-in replacement for the vscode uri
 * class, but has a filesystem associated with it.
 *
 * By associating the filesystem with the URI, we can allow for file URIs
 * to be scoped to a given filesystem (ie, a zip could be a filesystem )
 *
 * Uniform Resource Identifier (URI) https://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (https://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 *
 */
class Uri {
    fileSystem;
    uri;
    constructor(fileSystem, uri) {
        this.fileSystem = fileSystem;
        this.uri = uri;
    }
    static invalid = new Uri(undefined, vscode_uri_1.URI.parse('invalid:'));
    static isInvalid(uri) {
        return uri === undefined || Uri.invalid === uri;
    }
    /**
    * scheme is the 'https' part of 'https://www.msft.com/some/path?query#fragment'.
    * The part before the first colon.
    */
    get scheme() { return this.uri.scheme; }
    /**
    * authority is the 'www.msft.com' part of 'https://www.msft.com/some/path?query#fragment'.
    * The part between the first double slashes and the next slash.
    */
    get authority() { return this.uri.authority; }
    /**
     * path is the '/some/path' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get path() { return this.uri.path; }
    /**
     * query is the 'query' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get query() { return this.uri.query; }
    /**
     * fragment is the 'fragment' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get fragment() { return this.uri.fragment; }
    /**
    * Creates a new Uri from a string, e.g. `https://www.msft.com/some/path`,
    * `file:///usr/home`, or `scheme:with/path`.
    *
    * @param value A string which represents an URI (see `URI#toString`).
    */
    static parse(fileSystem, value, _strict) {
        return new Uri(fileSystem, vscode_uri_1.URI.parse(value, _strict));
    }
    /**
     * Creates a new Uri from a string, and replaces 'vsix' schemes with file:// instead.
     *
     * @param value A string which represents a URI which may be a VSIX uri.
     */
    static parseFilterVsix(fileSystem, value, _strict, vsixBaseUri) {
        const parsed = vscode_uri_1.URI.parse(value, _strict);
        if (vsixBaseUri && parsed.scheme === 'vsix') {
            return vsixBaseUri.join(parsed.path);
        }
        return new Uri(fileSystem, parsed);
    }
    /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
   * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
   * `URI.parse('file://' + path)` because the path might contain characters that are
   * interpreted (# and ?). See the following sample:
   * ```ts
  const good = URI.file('/coding/c#/project1');
  good.scheme === 'file';
  good.path === '/coding/c#/project1';
  good.fragment === '';
  const bad = URI.parse('file://' + '/coding/c#/project1');
  bad.scheme === 'file';
  bad.path === '/coding/c'; // path is now broken
  bad.fragment === '/project1';
  ```
   *
   * @param path A file system path (see `URI#fsPath`)
   */
    static file(fileSystem, path) {
        return new Uri(fileSystem, vscode_uri_1.URI.file(path));
    }
    /** construct an Uri from the various parts */
    static from(fileSystem, components) {
        return new Uri(fileSystem, vscode_uri_1.URI.from(components));
    }
    /**
     * Join all arguments together and normalize the resulting Uri.
     *
     * Also ensures that slashes are all forward.
     * */
    join(...paths) {
        return new Uri(this.fileSystem, this.with({ path: (0, path_1.join)(this.path, ...paths).replace(/\\/g, '/') }));
    }
    relative(target) {
        assert_1.strict.ok(target.authority === this.authority, `Uris '${target.toString()}' and '${this.toString()}' are not of the same base`);
        return (0, path_1.relative)(this.path, target.path).replace(/\\/g, '/');
    }
    /** returns true if the uri represents a file:// resource. */
    get isLocal() {
        return this.scheme === 'file' || this.scheme === 'vsix';
    }
    get isHttps() {
        return this.scheme === 'https';
    }
    /**
     * Returns a string representing the corresponding file system path of this URI.
     * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
     * platform specific path separator.
     *
     * * Will *not* validate the path for invalid characters and semantics.
     * * Will *not* look at the scheme of this URI.
     * * The result shall *not* be used for display purposes but for accessing a file on disk.
     *
     *
     * The *difference* to `URI#path` is the use of the platform specific separator and the handling
     * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
     *
     * ```ts
        const u = URI.parse('file://server/c$/folder/file.txt')
        u.authority === 'server'
        u.path === '/shares/c$/file.txt'
        u.fsPath === '\\server\c$\folder\file.txt'
    ```
     *
     * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
     * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
     * with URIs that represent files on disk (`file` scheme).
     */
    get fsPath() {
        return this.uri.fsPath;
    }
    /** Duplicates the current Uri, changing out any parts */
    with(change) {
        return new Uri(this.fileSystem, this.uri.with(change));
    }
    /**
    * Creates a string representation for this URI. It's guaranteed that calling
    * `URI.parse` with the result of this function creates an URI which is equal
    * to this URI.
    *
    * * The result shall *not* be used for display purposes but for externalization or transport.
    * * The result will be encoded using the percentage encoding and encoding happens mostly
    * ignore the scheme-specific encoding rules.
    *
    * @param skipEncoding Do not encode the result, default is `false`
    */
    toString(skipEncoding) {
        return this.uri.toString(skipEncoding);
    }
    get formatted() {
        return this.scheme === 'file' ? this.uri.fsPath : this.uri.toString();
    }
    /** returns a JSON object with the components of the Uri */
    toJSON() {
        return this.uri.toJSON();
    }
    toUrl() {
        return new url_1.URL(this.uri.toString());
    }
    /* Act on this uri */
    resolve(uriOrRelativePath) {
        return typeof uriOrRelativePath === 'string' ? this.join(uriOrRelativePath) : uriOrRelativePath ?? this;
    }
    stat(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.stat(uri);
    }
    readDirectory(uri, options) {
        uri = this.resolve(uri);
        return uri.fileSystem.readDirectory(uri, options);
    }
    async createDirectory(uri) {
        uri = this.resolve(uri);
        await uri.fileSystem.createDirectory(uri);
        return uri;
    }
    readFile(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.readFile(uri);
    }
    async readUTF8(uri) {
        return (0, text_1.decode)(await this.readFile(uri));
    }
    async tryReadUTF8(uri) {
        try {
            return await this.readUTF8(uri);
            // eslint-disable-next-line no-empty
        }
        catch { }
        return undefined;
    }
    openFile(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.openFile(uri);
    }
    readStream(start = 0, end = Infinity) {
        return this.fileSystem.readStream(this, { start, end });
    }
    async readBlock(start = 0, end = Infinity) {
        const stream = await this.fileSystem.readStream(this, { start, end });
        let block = Buffer.alloc(0);
        for await (const chunk of stream) {
            block = Buffer.concat([block, chunk]);
        }
        return block;
    }
    async writeFile(content) {
        await this.fileSystem.writeFile(this, content);
        return this;
    }
    writeUTF8(content) {
        return this.writeFile((0, text_1.encode)(content));
    }
    writeStream(options) {
        return this.fileSystem.writeStream(this, options);
    }
    delete(options) {
        return this.fileSystem.delete(this, options);
    }
    exists(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.exists(uri);
    }
    isFile(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.isFile(uri);
    }
    isSymlink(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.isSymlink(uri);
    }
    isDirectory(uri) {
        uri = this.resolve(uri);
        return uri.fileSystem.isDirectory(uri);
    }
    async size(uri) {
        return (await this.stat(uri)).size;
    }
    async hash(algorithm) {
        if (algorithm) {
            return await (0, hash_1.hash)(await this.fileSystem.readStream(this), this, await this.size(), algorithm, {});
        }
        return undefined;
    }
    async hashValid(events, matchOptions) {
        if (matchOptions?.algorithm && await this.exists()) {
            events.hashVerifyStart?.(this.fsPath);
            const result = matchOptions.value?.toLowerCase() === await (0, hash_1.hash)(await this.readStream(), this, await this.size(), matchOptions.algorithm, events);
            events.hashVerifyComplete?.(this.fsPath);
            return result;
        }
        return false;
    }
    get parent() {
        return new Uri(this.fileSystem, this.with({
            path: (0, path_1.dirname)(this.path)
        }));
    }
}
exports.Uri = Uri;
function isFilePath(uriOrPath) {
    if (uriOrPath) {
        if (uriOrPath instanceof Uri) {
            return uriOrPath.scheme === 'file';
        }
        if (uriOrPath.startsWith('file:')) {
            return true;
        }
        return !!(/^[/\\.]|^[a-zA-Z]:/g.exec((uriOrPath || '').toString()));
    }
    return false;
}
exports.isFilePath = isFilePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbInV0aWwvdXJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsbUNBQWdDO0FBQ2hDLCtCQUErQztBQUUvQyw2QkFBMEI7QUFDMUIsMkNBQWlDO0FBSWpDLGlDQUErQztBQUMvQyxpQ0FBd0M7QUFFeEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBYSxHQUFHO0lBQ3dCO0lBQTJDO0lBQWpGLFlBQXNDLFVBQXNCLEVBQXFCLEdBQVE7UUFBbkQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFxQixRQUFHLEdBQUgsR0FBRyxDQUFLO0lBRXpGLENBQUM7SUFFRCxNQUFNLENBQVUsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFNLFNBQVMsRUFBRSxnQkFBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRXpFLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBUztRQUN4QixPQUFPLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxDQUFDLE9BQU8sS0FBSyxHQUFHLENBQUM7SUFDbEQsQ0FBQztJQUNEOzs7TUFHRTtJQUNGLElBQUksTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXhDOzs7TUFHRTtJQUNGLElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRTlDOztPQUVHO0lBQ0gsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFcEM7O09BRUc7SUFDSCxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksQ0FB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
// SIG // Begin signature block
// SIG // MIIoTwYJKoZIhvcNAQcCoIIoQDCCKDwCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // x/tRWbbZ9tHUekVFj4KgPaXxMHkY7+MkbqZRaduipNmg
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
// SIG // ghoiMIIaHgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCD7kYY0rsC9Enhm
// SIG // fiUnUINrAzXe4Ienr/QQwOMbZRyiizBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAD/yC6vgUy8blfhCqKIPJTIv5CnXlhaE
// SIG // ad9rmdjQYrwjyhi09M4PkdHGGxXRHWCC9ToFuKTgHrbd
// SIG // te2Rq0BS//HHK1KxKK3TEW1t6sVflQ08HLSuQIVYTxRQ
// SIG // K/oHqXSEDdxs7PgN70rRh1BMMzy7CDN8PpItB0z6hhtw
// SIG // pqVRvJ/5MyK1PXb9r59gU8VuW7jP5RL6/ZJQu114H71U
// SIG // D6UYIg4CwK+FW4gdxhFVIGXdGsYljxqBXo3kKHg8oMdC
// SIG // VOzSs94IzAfVU0LZxmFTBrutgjHBkDg0HQSkvWOg/sGb
// SIG // DQtapojZZY9B+gFalWcuIOMECeyRF3v5W+VuM+OSRSV1
// SIG // WpehghesMIIXqAYKKwYBBAGCNwMDATGCF5gwgheUBgkq
// SIG // hkiG9w0BBwKggheFMIIXgQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWQYLKoZIhvcNAQkQAQSgggFIBIIBRDCCAUAC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // EUdcUGMTRzrh2S3VzFtACCrM03JhI+i+k4RhDB9s/48C
// SIG // Bme/t/w0KBgSMjAyNTA0MDExOTU5MTYuOTVaMASAAgH0
// SIG // oIHZpIHWMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // Tjo1NTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEfswggcoMIIF
// SIG // EKADAgECAhMzAAACAdFFWZgQzEJPAAEAAAIBMA0GCSqG
// SIG // SIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMB4XDTI0MDcyNTE4MzEyMloXDTI1MTAyMjE4MzEy
// SIG // MlowgdMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjU1
// SIG // MUEtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAg8AMIICCgKCAgEAtWrf+HzDu7sk50y5YHhe
// SIG // CIJG0uxRSFFcHNek+Td9ZmyJj20EEjaU8JDJu5pWc4pP
// SIG // AsBI38NEAJ1b+KBnlStqU8uvXF4qnEShDdi8nPsZZQsT
// SIG // ZDKWAgUM2iZTOiWIuZcFs5ZC8/+GlrVLM5h1Y9nfMh5B
// SIG // 4DnUQOXMremAT9MkvUhg3uaYgmqLlmYyODmba4lXZBu1
// SIG // 04SLAFsXOfl/TLhpToT46y7lI9sbI9uq3/Aerh3aPi2k
// SIG // nHvEEazilXeooXNLCwdu+Is6o8kQLouUn3KwUQm0b7aU
// SIG // tsv1X/OgPmsOJi6yN3LYWyHISvrNuIrJ4iYNgHdBBumQ
// SIG // YK8LjZmQaTKFacxhmXJ0q2gzaIfxF2yIwM+V9sQqkHkg
// SIG // /Q+iSDNpMr6mr/OwknOEIjI0g6ZMOymivpChzDNoPz9h
// SIG // kK3gVHZKW7NV8+UBXN4G0aBX69fKUbxBBLyk2cC+PhOo
// SIG // Ujkl6UC8/c0huqj5xX8m+YVIk81e7t6I+V/E4yXReeZg
// SIG // r0FhYqNpvTjGcaO2WrkP5XmsYS7IvMPIf4DCyIJUZaqo
// SIG // BMToAJJHGRe+DPqCHg6bmGPm97MrOWv16/Co6S9cQDkX
// SIG // p9vMSSRQWXy4KtJhZfmuDz2vr1jw4NeixwuIDGw1mtV/
// SIG // TdSI+vpLJfUiLl/b9w/tJB92BALQT8e1YH8NphdOo1xC
// SIG // wkcCAwEAAaOCAUkwggFFMB0GA1UdDgQWBBSwcq9blqLo
// SIG // PPiVrym9mFmFWbyyUjAfBgNVHSMEGDAWgBSfpxVdAF5i
// SIG // XYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5o
// SIG // dHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2Ny
// SIG // bC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIw
// SIG // MjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsG
// SIG // AQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20v
// SIG // cGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3Rh
// SIG // bXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8E
// SIG // AjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4GA1Ud
// SIG // DwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEAOjQA
// SIG // yz0cVztTFGqXX5JLRxFK/O/oMe55uDqEC8Vd1gbcM28K
// SIG // BUPgvUIPXm/vdDN2IVBkWHmwCp4AIcy4dZtkuUmd0fnu
// SIG // 6aT9Mvo1ndsLp2YJcMoFLEt3TtriLaO+i4Grv0ZULtWX
// SIG // UPAW/Mn5Scjgn0xZduGPBD/Xs3J7+get9+8ZvBipsg/N
// SIG // 7poimYOVsHxLcem7V5XdMNsytTm/uComhM/wgR5KlDYT
// SIG // VNAXBxcSKMeJaiD3V1+HhNkVliMl5VOP+nw5xWF55u9h
// SIG // 6eF2G7eBPqT+qSFQ+rQCQdIrN0yG1QN9PJroguK+FJQJ
// SIG // dQzdfD3RWVsciBygbYaZlT1cGJI1IyQ74DQ0UBdTpfeG
// SIG // syrEQ9PI8QyqVLqb2q7LtI6DJMNphYu+jr//0spr1UVv
// SIG // yDPtuRnbGQRNi1COwJcj9OYmlkFgKNeCfbDT7U3uEOvW
// SIG // omekX60Y/m5utRcUPVeAPdhkB+DxDaev3J1ywDNdyu91
// SIG // 1nAVPgRkyKgMK3USLG37EdlatDk8FyuCrx4tiHyqHO3w
// SIG // E6xPw32Q8e/vmuQPoBZuX3qUeoFIsyZEenHq2ScMunhc
// SIG // qW32SUVAi5oZ4Z3nf7dAgNau21NEPwgW+2wkrNqDg7Hp
// SIG // 8yHyoOKbgEBu6REQbvSfZ5Kh4PV+S2gxf2uq6GoYDnlq
// SIG // ABOMYwz309ISi0bPMh8wggdxMIIFWaADAgECAhMzAAAA
// SIG // FcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGI
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkg
// SIG // MjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMy
// SIG // MjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGm
// SIG // TOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YB
// SIG // f2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMM
// SIG // tY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTI
// SIG // cVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+
// SIG // NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130/o5T
// SIG // z9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi9
// SIG // 47SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uD
// SIG // RedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tn
// SIG // YN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/Nme
// SIG // Rd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03
// SIG // dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5
// SIG // TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy
// SIG // 16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkL
// SIG // iWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXps
// SIG // xREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqP
// SIG // nhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsG
// SIG // AQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqn
// SIG // Uv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsG
// SIG // AQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVw
// SIG // b3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEs
// SIG // H2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfC
// SIG // cTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2Y
// SIG // urYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/
// SIG // SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRW
// SIG // qveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wX
// SIG // sFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixr
// SIG // e24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoy
// SIG // GtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8
// SIG // x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk
// SIG // 2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pF
// SIG // EUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq7
// SIG // 7EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGC
// SIG // onsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1Zyvg
// SIG // DbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7
// SIG // vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0
// SIG // HVUzWLOhcGbyoYIDVjCCAj4CAQEwggEBoYHZpIHWMIHT
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // JzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo1NTFBLTA1
// SIG // RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUA1+26
// SIG // cR/yH100DiNFGWhuAv2rYBqggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsF
// SIG // AAIFAOuWXg8wIhgPMjAyNTA0MDExMjQzNTlaGA8yMDI1
// SIG // MDQwMjEyNDM1OVowdDA6BgorBgEEAYRZCgQBMSwwKjAK
// SIG // AgUA65ZeDwIBADAHAgEAAgIXzDAHAgEAAgIS8DAKAgUA
// SIG // 65evjwIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEE
// SIG // AYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0G
// SIG // CSqGSIb3DQEBCwUAA4IBAQB35YnFXGEDHW8xV8UWOW0S
// SIG // KjqFmPwfGAah6Y4Xt1ympRYtWtR2ifnUqeqbvkXEflSQ
// SIG // 2Cv2ePZEwFXew79C/htMh9in34dps3TFNXxdBU6aSV5N
// SIG // mLYeX54Y1/DLV6qhMajaCM1eAV+NnC93+aBR5bbbz/5a
// SIG // BJEvChxvfBJDPItb/tnM4KD+xFHVbbpawUd5IxUdjNFb
// SIG // XKPgvQe8cpGX6zUbZRUvK85QedP1kG+qW0Z3cd3N+5+4
// SIG // jurzp9sFreyBFJ1ih3Rx/nQPz46wPKq+V5J+l8eHzjTB
// SIG // sO5+lL1a+1VmLZvtVKzU9UXFlajk97IZO6NVMYuP83Jz
// SIG // ajBJ2JAhbXDiMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAIB0UVZmBDMQk8A
// SIG // AQAAAgEwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgAhCkcMK5Ry4EDDSiVZ9HwHmTTzqoCWdpA3bCVgbQ
// SIG // CfEwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCBY
// SIG // a7I6TJQRcmx0HaSTWZdJgowdrl9+Zrr0pIdqHtc4IzCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAACAdFFWZgQzEJPAAEAAAIBMCIEIJiVFHmh1TS0
// SIG // RrUYchmrk5oSYH8D1+LacSDy8m1WVq8TMA0GCSqGSIb3
// SIG // DQEBCwUABIICAFGZNHW0EuFd9Sbp7ae/50FBhao8boNx
// SIG // D/6ZDqjYZXW+ALfUDRXYzhAMVQ0ZJCfU5a5a4gJDwFp6
// SIG // 3d/S2to1JBePhb1sKRtXXFmnV3XRLAkehgVXo84PBNfF
// SIG // bMabX74wwzl0fKleXzvTchxiHPyz46luPs1WIEEF4VwZ
// SIG // JPkvlCYJj5VKpY5GILmjsSBkMH1FzSK8NbqBPb375mqQ
// SIG // sUOrYCp9svHAmSa6kDzcGKfvcZhXBIKsSjBxOty5HCAn
// SIG // +qbnX3EI8jUQnWmsu6KaLJPwXSQcpRNsjj88letBiweR
// SIG // OLEJlY5a42PlUk/G1FMxMskR0CpaLW9Xln+1nojjAAB4
// SIG // uUoVDkHUNVedvz/zx276IhL54hGVVcK7mDCZUOnrQuna
// SIG // qRgLvBFBYtlFgX0q7nB0RtmdTxswFmKCLCIQ4o9PUfzg
// SIG // nwsihXUjt3vc40Yctmgez2S2y0JwfXet+/JRQmETuS1Z
// SIG // E84TrSPhOKFtEu7h4VLMUMrvLNK03A3VdTWgPB6hqpjZ
// SIG // ACdmRNbJD3VJCGjnCPyvfPA0geKQj3nxhIshHfc1UhTi
// SIG // +eX9JVAQTshzG14bTX6z7Kkcfu9yHdGPngVegz5XtgRz
// SIG // H0kJcvGhiWeX61t1qaV2HMbsDCRsurWmG+JwrFCQ92vW
// SIG // /WqlV8wWpfDZUIzARmNzZo06JC355BpX6rFt
// SIG // End signature block
