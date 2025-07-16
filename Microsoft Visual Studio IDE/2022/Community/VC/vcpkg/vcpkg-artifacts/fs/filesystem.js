"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = exports.ReadHandle = exports.FileType = void 0;
/* eslint-disable @typescript-eslint/ban-types */
const node_events_1 = require("node:events");
const stream_1 = require("stream");
const uri_1 = require("../util/uri");
const size64K = 1 << 16;
const size32K = 1 << 15;
/**
* Enumeration of file types. The types `File` and `Directory` can also be
* a symbolic links, in that case use `FileType.File | FileType.SymbolicLink` and
* `FileType.Directory | FileType.SymbolicLink`.
*/
var FileType;
(function (FileType) {
    /**
     * The file type is unknown.
     */
    FileType[FileType["Unknown"] = 0] = "Unknown";
    /**
     * A regular file.
     */
    FileType[FileType["File"] = 1] = "File";
    /**
     * A directory.
     */
    FileType[FileType["Directory"] = 2] = "Directory";
    /**
     * A symbolic link to a file.
     */
    FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
/**
 * A random-access reading interface to access a file in a FileSystem.
 *
 * Ideally, we keep reads in a file to a forward order, so that this can be implemented on filesystems
 * that do not support random access (ie, please do your best to order reads so that they go forward only as much as possible)
 *
 * Underneath on FSes that do not support random access, this would likely require multiple 'open' operation for the same
 * target file.
 */
class ReadHandle {
    async readComplete(buffr, offset = 0, length = buffr.byteLength, position = null, totalRead = 0) {
        const { bytesRead, buffer } = await this.read(buffr, offset, length, position);
        if (length) {
            if (bytesRead && bytesRead < length) {
                return await this.readComplete(buffr, offset + bytesRead, length - bytesRead, position ? position + bytesRead : null, bytesRead + totalRead);
            }
        }
        return { bytesRead: bytesRead + totalRead, buffer };
    }
    /**
     * Returns a Readable for consuming an opened ReadHandle
     * @param start the first byte to read of the target
     * @param end the last byte to read of the target (inclusive!)
     */
    readStream(start = 0, end = Infinity) {
        return stream_1.Readable.from(asyncIterableOverHandle(start, end, this), {});
    }
    range(start, length) {
        return new RangeReadHandle(this, start, length);
    }
}
exports.ReadHandle = ReadHandle;
class RangeReadHandle extends ReadHandle {
    start;
    length;
    pos = 0;
    readHandle;
    constructor(readHandle, start, length) {
        super();
        this.start = start;
        this.length = length;
        this.readHandle = readHandle;
    }
    async read(buffer, offset, length, position) {
        if (this.readHandle) {
            position = position !== undefined && position !== null ? (position + this.start) : (this.pos + this.start);
            length = length === null ? this.length : length;
            const result = await this.readHandle.read(buffer, offset, length, position);
            this.pos += result.bytesRead;
            return result;
        }
        return {
            bytesRead: 0, buffer
        };
    }
    async size() {
        return this.length;
    }
    async close() {
        this.readHandle = undefined;
    }
}
/**
 * Picks a reasonable buffer size. Not more than 64k
 *
 * @param length
 */
function reasonableBuffer(length) {
    return Buffer.alloc(length > size64K ? size32K : length);
}
/**
 * Creates an AsyncIterable<Buffer> over a ReadHandle
 * @param start the first byte in the target read from
 * @param end the last byte in the target to read from
 * @param handle the ReadHandle
 */
async function* asyncIterableOverHandle(start, end, handle) {
    while (start < end) {
        // buffer alloc must be inside the loop; zlib will hold the buffers until it can deal with a whole stream.
        const buffer = reasonableBuffer(1 + end - start);
        const count = Math.min(1 + end - start, buffer.byteLength);
        const b = await handle.read(buffer, 0, count, start);
        if (b.bytesRead === 0) {
            return;
        }
        start += b.bytesRead;
        // return only what was actually read. (just a view)
        if (b.bytesRead === buffer.byteLength) {
            yield buffer;
        }
        else {
            yield buffer.slice(0, b.bytesRead);
        }
    }
}
class FileSystem extends node_events_1.EventEmitter {
    session;
    baseUri;
    /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * associates this FileSystem with the Uri
   *
   * @param path A file system path (see `URI#fsPath`)
   */
    file(path) {
        return uri_1.Uri.file(this, path);
    }
    /** construct an Uri from the various parts */
    from(components) {
        return uri_1.Uri.from(this, components);
    }
    /**
   * Creates a new URI from a string, e.g. `https://www.msft.com/some/path`,
   * `file:///usr/home`, or `scheme:with/path`.
   *
   * @param value A string which represents an URI (see `URI#toString`).
   */
    parseUri(value, _strict) {
        return uri_1.Uri.parse(this, value, _strict);
    }
    /** checks to see if the target exists */
    async exists(uri) {
        try {
            return !!(await this.stat(uri));
        }
        catch (e) {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a directory/folder */
    async isDirectory(uri) {
        try {
            return !!((await this.stat(uri)).type & FileType.Directory);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a file */
    async isFile(uri) {
        try {
            const s = await this.stat(uri);
            return !!(s.type & FileType.File);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a symbolic link */
    async isSymlink(uri) {
        try {
            return !!((await this.stat(uri)) && FileType.SymbolicLink);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    constructor(session) {
        super();
        this.session = session;
    }
    /** EventEmitter for when files are read */
    read(path, context) {
        this.emit('read', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are written */
    write(path, context) {
        this.emit('write', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are deleted */
    deleted(path, context) {
        this.emit('deleted', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are renamed */
    renamed(path, context) {
        this.emit('renamed', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when directories are read */
    directoryRead(path, contents) {
        this.emit('directoryRead', path, contents, this.session.stopwatch.total);
    }
    /** EventEmitter for when direcotries are created */
    directoryCreated(path, context) {
        this.emit('directoryCreated', path, context, this.session.stopwatch.total);
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJmcy9maWxlc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsaURBQWlEO0FBRWpELDZDQUEyQztBQUMzQyxtQ0FBNEM7QUFFNUMscUNBQWtDO0FBRWxDLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDeEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQXVDeEI7Ozs7RUFJRTtBQUNGLElBQVksUUFpQlg7QUFqQkQsV0FBWSxRQUFRO0lBQ2xCOztPQUVHO0lBQ0gsNkNBQVcsQ0FBQTtJQUNYOztPQUVHO0lBQ0gsdUNBQVEsQ0FBQTtJQUNSOztPQUVHO0lBQ0gsaURBQWEsQ0FBQTtJQUNiOztPQUVHO0lBQ0gsd0RBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQWpCVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQWlCbkI7QUFRRDs7Ozs7Ozs7R0FRRztBQUNILE1BQXNCLFVBQVU7SUFXOUIsS0FBSyxDQUFDLFlBQVksQ0FBNkIsS0FBYyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBMEIsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDO1FBQ2pKLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9FLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxTQUFTLElBQUksU0FBUyxHQUFHLE1BQU0sRUFBRTtnQkFDbkMsT0FBTyxNQUFNLElBQUksQ0FB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
// SIG // Begin signature block
// SIG // MIIoUgYJKoZIhvcNAQcCoIIoQzCCKD8CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // nLkG9ta88s7AMrRh67jTSV5nCt9M+PUfGPBYuaVkQOmg
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
// SIG // gholMIIaIQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAH/Il6185HQp3x
// SIG // u/1GtVe4W1brTrdzv99Kmj0acxEDRDBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBADZ8yl9pDkyJgC/t7p8493PzJBicwon4
// SIG // abOzM/47hJeAMglmJOKswmzg2qOkLEZYTg4x35FBX0Wy
// SIG // DUgqDv/SNFFkL976UM0fzTVDqs+DoTEqq3acjOjCWv5m
// SIG // HYnXwpH3WpqFCMGlhzVeGF+li83sFAF64XaL/SKmASNv
// SIG // Clu5IEOH8rYonCG18AoBOXY7bKL1ppcDHVzBrXPbNpDo
// SIG // xzHVV49Vc6g8v5gUdXIw6D2N97TlJz+RfovfwglBo848
// SIG // i4n3caNDwJTptbs81buW1K+T6Nb/FREGxSI6PYMGIc1L
// SIG // zUlSbYGIczVicw1LCl+vW7bAF2yuGHRrG4pGEolziyf6
// SIG // 6WihghevMIIXqwYKKwYBBAGCNwMDATGCF5swgheXBgkq
// SIG // hkiG9w0BBwKggheIMIIXhAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // aitAwgcNvBKCaUfT6jqO1BD1pQ5FrlmjguIbWV0TDIkC
// SIG // Bme2HeQTzxgTMjAyNTA0MDExOTU5NDMuNzM4WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NDMxQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH9MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfr7O0TTdzPG0wABAAAB+jANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMTFaFw0yNTEwMjIxODMx
// SIG // MTFaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo0
// SIG // MzFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBAMoWVQTNz2XAXxKQH+3y
// SIG // CIcoMGFVT+uFEnmW0pUUd6byXm72tC0Ag1uOcjq7acCK
// SIG // Rsgxl/hGwmx4UuU3eCdGJXPN87SxG20A+zOpKkdF4/p/
// SIG // NnBrHv0JzB9FkWS58IICXXp6UOlHIjOJzGGb3UI8mwOK
// SIG // noznvWNO9yZV791SG3ZEB9iRsk/KAfy7Lzy/5AJyeOaE
// SIG // CKe0see0T0P9Duqmsidkia8HIwPGrjHQJ2SjosRZc6KK
// SIG // Ie0ssnCOwRDR06ZFSq0VeWHpUb1jU4NaR+BAtijtm8bA
// SIG // Tdt27THk72RYnhiK/g/Jn9ZUELNB7f7TDlXWodeLe2JP
// SIG // sZeT+E8N8XwBoB7L7GuroK8cJik019ZKlx+VwncN01Xi
// SIG // gmseiVfsoDOYtTa6CSsAQltdT8ItM/5IvdGXjul3xBPZ
// SIG // gpyZu+kHMYt7Z1v2P92bpikOl/4lSCaOy5NGf6QE0cAC
// SIG // DasHb86XbV9oTiYm+BkfIrNm6SpLNOBrq38Hlj5/c+o2
// SIG // OxgQvo7PKUsBnsK338IAGzSpvNmQxb6gRkEFScCB0l6Y
// SIG // 5Evht/XsmDhtq3CCwSA5c1MzBRSWzYebQ79xnidxCrwu
// SIG // LzUgMbRn2hv5kISuN2I3r7Ae9i6LlO/K8bTYbjF0s2h6
// SIG // uXxYht83LGB2muPsPmJjK4UxMw+EgIrId+QY6Fz9T9Qr
// SIG // eFWtAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUY4xymy+V
// SIG // lepHdOiqHEB6YSvVP78wHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBALhW
// SIG // wqKxa76HRvmTSR92Pjc+UKVMrUFTmzsmBa4HBq8aujFG
// SIG // uMi5sTeMVnS9ZMoGluQTmd8QZT2O1abn+W+Xmlz+6kau
// SIG // tcXjq193+uJBoklqEYvRCWsCVgsyX1EEU4Qy+M8SNqWH
// SIG // NcJz6e0OveWx6sGdNnmjgbnYfyHxJBntDn4+iEt6MmbC
// SIG // T9cmrXJuJAaiB+nW9fsHjOKuOjYQHwH9O9MxehfiKVB8
// SIG // obTG0IOfkB3zrsgc67euwojCUinCd5zFcnzZZ7+sr7bW
// SIG // Myyt8EvtEMCVImy2CTCOhRnErkcSpaukYzoSvS90Do4d
// SIG // FQjNdaxzNdWZjdHriW2wQlX0BLnzizZBvPDBQlDRNdEk
// SIG // mzPzoPwm05KNDOcG1b0Cegqiyo7R0qHqABj3nl9uH+XD
// SIG // 2Mk3CpWzOi6FHTtj+SUnSObNSRfzp+i4lE+dGnaUbLWW
// SIG // o22BHl/ze0b0m5J9HYw9wb09jn91n/YCHmkCB279Sdjv
// SIG // z+UDj0IlaPPtACpujNEyjnbooYSsQLf+mMpNexb90SHY
// SIG // 0+sIi9qkSBLIDiad3yC8OJkET7t7KUX2pEqEHuTdHuB1
// SIG // hX/FltmS9PnPN0M4d1bRDyOmNntgTv3loU2GyGx6amA3
// SIG // wLQGLWmCHXvO2cplxtzDtsFI4S/R70kM46KrqvjqFJr3
// SIG // wVHAdnuS+kAhzuqkzu1qMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCA1gwggJAAgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NDMxQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAPeG
// SIG // fm1CZ/pysAbyCOrINDcu2jw2oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlqaWMCIYDzIwMjUwNDAxMTc1MzI2WhgPMjAy
// SIG // NTA0MDIxNzUzMjZaMHYwPAYKKwYBBAGEWQoEATEuMCww
// SIG // CgIFAOuWppYCAQAwCQIBAAIBUAIB/zAHAgEAAgITzDAK
// SIG // AgUA65f4FgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgor
// SIG // BgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYag
// SIG // MA0GCSqGSIb3DQEBCwUAA4IBAQCizUHpkLniqcOQ4zjv
// SIG // v1wbnQGQJxRVnh916ef2q8B65xCFPcdkouWJdqNnn8es
// SIG // Jfq5THYZ/IXX8GeJ78kycUvIOKIyZTfm4skEilRDoPag
// SIG // oEcc5+BZeCWt9I7UfhyMU4t921wpvYSA35oazXdjDqUb
// SIG // vxZ44n0XdRQPK19FpOzHM91Av//NXapgsqnysdYZ+52/
// SIG // UjhVneItsFeXk5hpgFYAUJKo2ikExYU3FvQIfYqRUSDI
// SIG // m/5CX0Y8GjykwSRjvjDeSA8oTjI7bav47b3aURCWPIMR
// SIG // VfhmUHRSbAZvpMkRrisXEy3F6zQbaLbYLNJjGp2LwXQX
// SIG // PMKmW/yaZ/nZv5e1MYIEDTCCBAkCAQEwgZMwfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAH6+ztE03cz
// SIG // xtMAAQAAAfowDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqG
// SIG // SIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0B
// SIG // CQQxIgQg4+m7FmbXO3jzz9zIFVoPkQmYiul0JEeiUhrB
// SIG // hAdnCaswgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9
// SIG // BCB98n8tya8+B2jjU/dpJRIwHwHHpco5ogNStYocbkOe
// SIG // VjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAAB+vs7RNN3M8bTAAEAAAH6MCIEIHET/s6N
// SIG // qQyC9bS4mryIsccEpxZBcZX3PurFe7E+39QzMA0GCSqG
// SIG // SIb3DQEBCwUABIICAEE1HQaW6DRb1IG+0Z2J7X+IhlLM
// SIG // iaGhLNIsSnIAprcnADoPcxuuag/T3QDIxNtsak7NPL01
// SIG // 5vzpN20g58VFoUyGUonwf80wEKgGGJ8cSPbBDJuNSr/8
// SIG // weFm6fRH1BAAFAPfOFDokbvr/ME2w8KqCPk+QgD/Zp1e
// SIG // 72eqiZmRBg5p4UjOqCPBZK29NW0YEhnKrXlGrx21KU5i
// SIG // nRWvUzeyKAjgCnsMjcAtEyRhFZo1cOpTOfVfZApA0v+T
// SIG // NJ+3/TrxpJAiTMeqkabCnAvC8p1saM9XRhxr69l/2yGF
// SIG // Fzfb8ZhtTVSSGqba87CwAjkPVP28AkvDcJ7TnRc+yi0h
// SIG // 7nQ90sUx0VmCpU/oxJfYWmXcP9/SPaD8/ynNd7w9XiED
// SIG // pTOXMqjfXwkI3VZHEl3mn5cmeHY8oWCtGxUKoXdCEpGG
// SIG // 53ZZIJzBpqZxhJQ13Qz3hGsbdulz3eCaKH65Rj0b3LTM
// SIG // z38pDG0bCZEFccSBQpsEN52IzQ0gGrUUiCZ6zwDMAn/s
// SIG // LeouvakqXyfsSIGxxZj+M5XqkQxRXvioLhLd0Fn0xrtY
// SIG // xY8FPEQbNJZyTTqzC5IMvLNQEuaHLlkyQaq/YnwHR69q
// SIG // HGvFYAcHjFtUuUl/joS4j4gasyqG2TtwKCsw2yDbDNFW
// SIG // CuXFGBL4eG1EcRfM15koeRZc7RMoK1X3CIEwJEGC
// SIG // End signature block
