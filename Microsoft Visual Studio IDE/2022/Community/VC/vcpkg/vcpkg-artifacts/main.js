#!/usr/bin/env node
"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = void 0;
const child_process_1 = require("child_process");
const process_1 = require("process");
const command_line_1 = require("./cli/command-line");
const acquire_1 = require("./cli/commands/acquire");
const acquire_project_1 = require("./cli/commands/acquire-project");
const activate_1 = require("./cli/commands/activate");
const add_1 = require("./cli/commands/add");
const cache_1 = require("./cli/commands/cache");
const clean_1 = require("./cli/commands/clean");
const deactivate_1 = require("./cli/commands/deactivate");
const delete_1 = require("./cli/commands/delete");
const find_1 = require("./cli/commands/find");
const generate_msbuild_props_1 = require("./cli/commands/generate-msbuild-props");
const list_1 = require("./cli/commands/list");
const regenerate_index_1 = require("./cli/commands/regenerate-index");
const remove_1 = require("./cli/commands/remove");
const update_1 = require("./cli/commands/update");
const use_1 = require("./cli/commands/use");
const styling_1 = require("./cli/styling");
const i18n_1 = require("./i18n");
const session_1 = require("./session");
// parse the command line
const commandline = new command_line_1.CommandLine(process_1.argv.slice(2));
(0, i18n_1.setLocale)(commandline.language);
require('./exports');
async function main() {
    // ensure we can execute commands from this process.
    // this works around an odd bug in the way that node handles
    // executing child processes where the target is a windows store symlink
    (0, child_process_1.spawn)(process.argv0, ['--version']);
    // create our session for this process.
    exports.session = new session_1.Session(process.cwd(), commandline.context, commandline);
    (0, styling_1.initStyling)(commandline, exports.session);
    // start up the session and init the channel listeners.
    await exports.session.init();
    const find = new find_1.FindCommand(commandline);
    const list = new list_1.ListCommand(commandline);
    const add = new add_1.AddCommand(commandline);
    const acquire_project = new acquire_project_1.AcquireProjectCommand(commandline);
    const acquire = new acquire_1.AcquireCommand(commandline);
    const use = new use_1.UseCommand(commandline);
    const remove = new remove_1.RemoveCommand(commandline);
    const del = new delete_1.DeleteCommand(commandline);
    const activate = new activate_1.ActivateCommand(commandline);
    const activate_msbuildprops = new generate_msbuild_props_1.GenerateMSBuildPropsCommand(commandline);
    const deactivate = new deactivate_1.DeactivateCommand(commandline);
    const regenerate = new regenerate_index_1.RegenerateCommand(commandline);
    const update = new update_1.UpdateCommand(commandline);
    const cache = new cache_1.CacheCommand(commandline);
    const clean = new clean_1.CleanCommand(commandline);
    const command = commandline.command;
    if (!command) {
        // no command recognized.
        // did they specify inputs?
        if (commandline.inputs.length > 0) {
            // unrecognized command
            (0, styling_1.error)(`Unrecognized command '${commandline.inputs[0]}'`);
            return process.exitCode = 1;
        }
        return process.exitCode = 0;
    }
    let result = true;
    try {
        result = await command.run();
    }
    catch (e) {
        // in --debug mode we want to see the stack trace(s).
        if (commandline.debug && e instanceof Error) {
            (0, styling_1.log)(e.stack);
            if (e instanceof AggregateError) {
                e.errors.forEach(each => (0, styling_1.log)(each.stack));
            }
        }
        (0, styling_1.error)(e);
        await exports.session.writeTelemetry();
        return process.exit(1);
    }
    finally {
        await exports.session.writeTelemetry();
    }
    return process.exit(result ? 0 : 1);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLGlEQUFzQztBQUN0QyxxQ0FBK0I7QUFDL0IscURBQWlEO0FBQ2pELG9EQUF3RDtBQUN4RCxvRUFBdUU7QUFDdkUsc0RBQTBEO0FBQzFELDRDQUFnRDtBQUNoRCxnREFBb0Q7QUFDcEQsZ0RBQW9EO0FBQ3BELDBEQUE4RDtBQUM5RCxrREFBc0Q7QUFDdEQsOENBQWtEO0FBQ2xELGtGQUFvRjtBQUNwRiw4Q0FBa0Q7QUFDbEQsc0VBQW9FO0FBQ3BFLGtEQUFzRDtBQUN0RCxrREFBc0Q7QUFDdEQsNENBQWdEO0FBQ2hELDJDQUF3RDtBQUN4RCxpQ0FBbUM7QUFDbkMsdUNBQW9DO0FBRXBDLHlCQUF5QjtBQUN6QixNQUFNLFdBQVcsR0FBRyxJQUFJLDBCQUFXLENBQUMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBR25ELElBQUEsZ0JBQVMsRUFBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFHaEMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRXJCLEtBQUssVUFBVSxJQUFJO0lBRWpCLG9EQUFvRDtJQUNwRCw0REFBNEQ7SUFDNUQsd0VBQXdFO0lBQ3hFLElBQUEscUJBQUssRUFBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUVwQyx1Q0FBdUM7SUFDdkMsZUFBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBTyxXQUFXLENBQUMsQ0FBQztJQUU1RSxJQUFBLHFCQUFXLEVBQUMsV0FBVyxFQUFFLGVBQU8sQ0FBQyxDQUFDO0lBRWxDLHVEQUF1RDtJQUN2RCxNQUFNLGVBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVyQixNQUFNLElBQUksR0FBRyxJQUFJLGtCQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxrQkFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sR0FBRyxHQUFHLElBQUksZ0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN4QyxNQUFNLGVBQWUsR0FBRyxJQUFJLHVDQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9ELE1BQU0sT0FBTyxHQUFHLElBQUksd0JBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNoRCxNQUFNLEdBQUcsR0FBRyxJQUFJLGdCQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sR0FBRyxHQUFHLElBQUksc0JBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLDBCQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLG9EQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sVUFBVSxHQUFHLElBQUksOEJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFdEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQ0FBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLHNCQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxvQkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksb0JBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUU1QyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWix5QkFBeUI7UUFFekIsMkJBQTJCO1FBQzNCLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLHVCQUF1QjtZQUN2QixJQUFBLGVBQUssRUFBQyx5QkFBeUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsT0FBTyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUM3QjtRQUVELE9BQU8sT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDbEIsSUFBSTtRQUNGLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUM5QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YscURBQXFEO1FBQ3JELElBQUksV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO1lBQzNDLElBQUEsYUFBRyxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxZQUFZLGNBQWMsRUFBRTtnQkFDL0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFBLGFBQUcsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMzQztTQUNGO1FBRUQsSUFBQSxlQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFFVCxNQUFNLGVBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMvQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEI7WUFBUztRQUNSLE1BQU0sZUFBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ2hDO0lBRUQsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsbUVBQW1FO0FBQ25FLElBQUksRUFBRSxDQUFDIn0=
// SIG // Begin signature block
// SIG // MIIoUwYJKoZIhvcNAQcCoIIoRDCCKEACAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 5O4bWcoTEDJNXlW+myfgJDfXeCYVMEo4SYU64xi0iUWg
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
// SIG // ghomMIIaIgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCTWiiv93w09HDx
// SIG // B/db+rPm5ltDlRlVw99EHo+ZEeojEzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACywGeiFzNbH7WGL8EZ0Rl+XBYjLyMiO
// SIG // FM2tgvWi1qT9CsHOktnkI2tzjd3Mng/s3YNf1/rFw4Pl
// SIG // X2d7Pexcomuz5omYOVh4Dib1CU5WErWzxbpK4MvLqPY8
// SIG // Aksvwz6XXKVErmYDqABUNNwmiQFCk1Mihc6/A7SRvQe5
// SIG // a9zjGSUcWk1dBacMewIQga5YMT0f6ZcCCDDiNXr1Ih3h
// SIG // hN16BYXm2jxyC+stBJfLsSBgUu61j7m0QEIhY8llmBSK
// SIG // cWG2ZbxP59WrJAr66elDjqHefh6x3qFLSjznTRIGeb4v
// SIG // d4H7ZHsMh4CldXZTvrXVc5EXgWUBNTNjw8SqHHI9snhi
// SIG // 4a6hghewMIIXrAYKKwYBBAGCNwMDATGCF5wwgheYBgkq
// SIG // hkiG9w0BBwKggheJMIIXhQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // upbFejzqtiTbudlHs0ABbYB7/sowomRJxqUWYS+1n30C
// SIG // Bme2M5Hz0hgTMjAyNTA0MDExOTU5MjEuOTAyWjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NkIwNS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH+MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfaDLyZqVF0iwQABAAAB9jANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMDRaFw0yNTEwMjIxODMx
// SIG // MDRaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo2
// SIG // QjA1LTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBANFCXizEfzfVjwWYbilR
// SIG // RfnliWevFro3Y+F+iUdOXMTuQnqTV6Ne61Ws8Fi5JuQI
// SIG // 2lYdfWVYwwoR84psbKGl8TbvCA4ICsKV76QACLb+FMed
// SIG // HvUtrlcHyr+e6fSShvkO1TjUobo5dTQjJHIEqz3Znf/M
// SIG // 3LJoc3DaGy6JqwgCDkWfCMIWMuLIlUJX9TSoZcgM5pFi
// SIG // Q9DfutCIqIBQc4N8iErL66DsdMdcUotj4kSEJU1xO+DI
// SIG // IGQyAyqh/4W/RU9pCv51f2l47qPSzK60Zp+OKGGAA3v6
// SIG // zveRfkht7rroX/h+CK4l69IfabQOksByT0tlZmzVgo0F
// SIG // quRuGJK3KmzzGse7zV1MLu0+uRPHxT3dSLhPUbBuEzAF
// SIG // e15FwaKZjzX7y9IY8YOOJKUJ9/OFeOqPs3UKsuSvXQ5V
// SIG // pvyer2baecgNT8g98Ph2xrm0tJ4hENS+sBjqz38yJtBX
// SIG // Tp/sRaOPBEZfhccP9zr1zOQmNRKp8xM5z48yXOzicISV
// SIG // Ud1UAx4wXBBUzr0vRNHYjbtXqHMPmQpM+D7v6EL/oKlP
// SIG // m38S/HuzxZLX0Q5TOhcjs4z+M7iNuYA/LTvcyYOoOn0a
// SIG // WmXON/ZgG5Jd8wlc0yw4HIb+ksUGoybb76EGmcUH9LUY
// SIG // j3G69h1nzKKqnfbokNIU1BIRuOBQUk3lD2XhHp0QlmnQ
// SIG // luBvAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUSMGbCbjn
// SIG // CX0nD1nF2bgQOAfPSvIwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBANd5
// SIG // AYqx9XB7tVmEdcrI9duaJhrUND2kJBM8Bm+9MbakqCPr
// SIG // L0IobIHU2MWj36diFRXYI2jGgYvNcAfP57vOuhXxSinY
// SIG // Xad8JzGfdT6T+DqHuzXH+qiApIErsIHSHUL6hNIfFUOU
// SIG // FubA1eENCZ4+H+yh2MeDYjPAuI08PEkLbLsVokx9h4pH
// SIG // 90GAe9Wu3Qfc4BzpFtIYFBHljvZodsFqmEv0OPAEozqm
// SIG // MP4WueKFTn39tlmqB/vx8XfTUxFP+L5b7ESDFk9I7JzS
// SIG // O9Y1QK0+EPQbelUoVs8qq2hOkilKGaxMAaVbCNCzINl9
// SIG // 4Ti25Qtb8TN/sDMjofe2hTrO7BZ7nprSNjH4/KoNegWU
// SIG // ycV5aT7q1qxvjgY+AaEw5AvQMV2Ad8hLbsDLO6UVi8sS
// SIG // McP8FfUxylBpvsflRNDzi8JK0jII7pUl5KXxCx1loglb
// SIG // JSWxSCAf+AJb/o0CUigCbqPQhK25tqng5P84yWJWGlRj
// SIG // MirmGfrkkVSgdqpBD3BMxtXTvcyGtTKd9ifs81tz+7Li
// SIG // X48OtrN4Qzi5PupTEDkdOMftqNexty3Hi5JMSZuNRK3Y
// SIG // k4wJnQpXp/cpeh4DKRkuKJIxQiV/gqThV+4AQNz1cUFr
// SIG // m4rAEGy+R4ExQbUDRM3AnYdRmMP+p88zTbftBkJ56GwX
// SIG // XXzgIqpM7yLal47xsitUMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCA1kwggJBAgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NkIwNS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVABVP
// SIG // XkqXcbNGtOiRSLhhRyI/yPt+oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDrlrxJMCIYDzIwMjUwNDAxMTkyNjAxWhgPMjAy
// SIG // NTA0MDIxOTI2MDFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOuWvEkCAQAwCgIBAAICQXoCAf8wBwIBAAICFFUw
// SIG // CgIFAOuYDckCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQsFAAOCAQEA4+Xw1sMZxhaRW/nH
// SIG // MaqKjjL34+3j78CVg1byb8c6SKXQoqV5NA5/+nx2RiYH
// SIG // kASJFVpp1hnwQqQ6/5ahWfGwLKSape7w5ekuwfk3n/Rt
// SIG // n/m8dtkeevIntvdllImI4X92lM588QNjA+NkksgVLDLk
// SIG // EwcH+JakExLQiMlDeJwm9sr/MO57YS8CXo1wh181jgJc
// SIG // +4nxsDgZt0mXpJH/eH8M/zBpWH854EFRMAWJfpZWTSQW
// SIG // w27vwPyucW9841wnj6Pbq2VBUjz7LN09Jfktx7s6y46c
// SIG // mHx7OqIKS466bXBmBZH5q9/jSy8aofAZ2hTmd0Ph/qQ+
// SIG // o9MRFxKsiZ/wQs42/DGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB9oMvJmpU
// SIG // XSLBAAEAAAH2MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEILnZxFPjgbZBnviy3nN9KTEqh8HOb6+FRFSZ
// SIG // +g2IEg9/MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgK2FM8ZRepuVEi0uH/DVy//GqDRFXbAmUZhfi5UIx
// SIG // tqIwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAfaDLyZqVF0iwQABAAAB9jAiBCAHYrTD
// SIG // 4+x4NhgRFjvFXdkbrNlVNIvQYOYeM0G+jJ/RcTANBgkq
// SIG // hkiG9w0BAQsFAASCAgC2vrnplpDQOUGQLtY65AOpl6Ih
// SIG // OpTayclVAHtVo8yQvdvtbJINxSfyXZnarXdcFUWqxfWQ
// SIG // Xw2cjd+o/7r5budmrp+h5DFCMb8wQVKdbQ81KWcQcyJp
// SIG // u5FL51lB0rJKlL9j/A/NTpI/rgx5Peah/NOLkvdob16d
// SIG // lvS8ohzhwmuR3ZLugBB17EwcO3iZV347ZUfutEo7Znwu
// SIG // I/3stoBdJ9gvdxBt47sW607X1T5Ic2l2xx59Yk9AS45p
// SIG // BoJKZYXbkzpwwtZkcWvtWI+8voZfObOs72f7ceEizcqU
// SIG // 9LCjP4ahoB7orBx6aC1gjafrBRHuOloLrmLkLiJp/rDg
// SIG // 6WZoPS+HzSug4ZTa0FTNd+j2Am6srrYJr4295F4HtWa3
// SIG // pnETgpt9Kf8fg5S5AgjSO/OF8cka9192D6u1AjES5KFD
// SIG // 2bc5ou26XU7PUDZf+CYuIKVxC9ONjWRWrEwvDQaVQBE+
// SIG // 9rFD5Q3Dog+Jeohs8ngayEDsKMOasVGJdwLwnyZhaA02
// SIG // kPRFwf8t6d4dWLwdYi2jMw6qGxGHSZbXF/OngPvC4s5r
// SIG // D5fAmtqiDdfR7+fdgaelo6Uj/Scaq6gWqFU1Zsujov7Z
// SIG // fn1LXiZCObsjbEGH8IZvWtRXX8nhYbnpFEj3Th6mhDbx
// SIG // 5rfZ89p1zHi4T2JDsNnJqsKkfMnPRXE6wDfuJWEPRw==
// SIG // End signature block
