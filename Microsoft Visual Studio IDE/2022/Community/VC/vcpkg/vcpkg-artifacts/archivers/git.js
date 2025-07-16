"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Git = void 0;
const exec_cmd_1 = require("../util/exec-cmd");
const uri_1 = require("../util/uri");
/** @internal */
class Git {
    #toolPath;
    #targetFolder;
    constructor(toolPath, targetFolder) {
        this.#toolPath = toolPath;
        this.#targetFolder = targetFolder;
    }
    /**
     * Method that clones a git repo into a desired location and with various options.
     * @param repo The Uri of the remote repository that is desired to be cloned.
     * @param events The events that may need to be updated in order to track progress.
     * @param options The options that will modify how the clone will be called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the clone did what we expected.
     */
    async clone(repo, events, options = {}) {
        const remote = await (0, uri_1.isFilePath)(repo) ? repo.fsPath : repo.toString();
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            'clone',
            remote,
            this.#targetFolder.fsPath,
            options.recursive ? '--recursive' : '',
            options.depth ? `--depth=${options.depth}` : '',
            '--progress'
        ], {
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Fetches a 'tag', this could theoretically be a commit, a tag, or a branch.
     * @param remoteName Remote name to fetch from. Typically will be 'origin'.
     * @param events Events that may be called in order to present progress.
     * @param options Options to modify how fetch is called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the fetch did what we expected.
     */
    async fetch(remoteName, events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'fetch',
            remoteName,
            options.commit ? options.commit : '',
            options.depth ? `--depth=${options.depth}` : ''
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Checks out a specific commit. If no commit is given, the default behavior of a checkout will be
     * used. (Checking out the current branch)
     * @param events Events to possibly track progress.
     * @param options Passing along a commit or branch to checkout, optionally.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the checkout did what we expected.
     */
    async checkout(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'checkout',
            options.commit ? options.commit : ''
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Performs a reset on the git repo.
     * @param events Events to possibly track progress.
     * @param options Options to control how the reset is called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the reset did what we expected.
     */
    async reset(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'reset',
            options.commit ? options.commit : '',
            options.recurse ? '--recurse-submodules' : '',
            options.hard ? '--hard' : ''
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Initializes a folder on disk to be a git repository
     * @returns true if the initialization was successful, false otherwise.
     */
    async init() {
        if (!await this.#targetFolder.exists()) {
            await this.#targetFolder.createDirectory();
        }
        if (!await this.#targetFolder.isDirectory()) {
            throw new Error(`${this.#targetFolder.fsPath} is not a directory.`);
        }
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, ['init'], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Adds a remote location to the git repo.
     * @param name the name of the remote to add.
     * @param location the location of the remote to add.
     * @returns true if the addition was successful, false otherwise.
     */
    async addRemote(name, location) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'remote',
            'add',
            name,
            location.toString()
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0;
    }
    /**
     * updates submodules in a git repository
     * @param events Events to possibly track progress.
     * @param options Options to control how the submodule update is called.
     * @returns true if the update was successful, false otherwise.
     */
    async updateSubmodules(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'submodule',
            'update',
            '--progress',
            options.init ? '--init' : '',
            options.depth ? `--depth=${options.depth}` : '',
            options.recursive ? '--recursive' : '',
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0;
    }
    /**
     * sets a git configuration value in the repo.
     * @param configFile the relative path to the config file inside the repo on disk
     * @param key the key to set in the config file
     * @param value the value to set in the config file
     * @returns true if the config file was updated, false otherwise
     */
    async config(configFile, key, value) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            'config',
            '-f',
            this.#targetFolder.join(configFile).fsPath,
            key,
            value
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0;
    }
}
exports.Git = Git;
function chunkToHeartbeat(events) {
    return (chunk) => {
        const regex = /\s([0-9]*?)%/;
        chunk.toString().split(/^/gim).map((x) => x.trim()).filter((each) => each).forEach((line) => {
            const match_array = line.match(regex);
            if (match_array !== null) {
                events.unpackArchiveHeartbeat?.(line.trim());
            }
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImFyY2hpdmVycy9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUdsQywrQ0FBMkM7QUFDM0MscUNBQThDO0FBTTlDLGdCQUFnQjtBQUNoQixNQUFhLEdBQUc7SUFDZCxTQUFTLENBQVM7SUFDbEIsYUFBYSxDQUFNO0lBRW5CLFlBQVksUUFBZ0IsRUFBRSxZQUFpQjtRQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBUyxFQUFFLE1BQTZCLEVBQUUsVUFBbUQsRUFBRTtRQUN6RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsZ0JBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXRFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0MsT0FBTztZQUNQLE1BQU07WUFDTixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQy9DLFlBQVk7U0FDYixFQUFFO1lBQ0QsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUN0QyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFrQixFQUFFLE1BQTZCLEVBQUUsVUFBK0MsRUFBRTtRQUM5RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsa0JBQU8sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzNDLElBQUk7WUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDekIsT0FBTztZQUNQLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ2hELEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1NBQy9CLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUE2QixFQUFFLFVBQStCLEVBQUU7UUFDN0UsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3JDLEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQzlCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDdEMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztTQUN2QyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBR0Q7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUE2QixFQUFFLFVBQWtFLEVBQUU7UUFDN0csTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLE9BQU87WUFDUCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUM3QixFQUFFO1lBQ0QsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUM5QixZQUFZLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQ3RDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDMUMsQ0FBQztJQUdEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN2QyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUUsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sc0JBQXNCLENBQUMsQ0FBQztTQUNyRTtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1NBQy9CLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBWSxFQUFFLFFBQWE7UUFDekMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLFFBQVE7WUFDUixLQUFLO1lBQ0wsSUFBSTtZQUNKLFFBQVEsQ0FBQyxRQUFRLEVBQUU7U0FDcEIsRUFBRTtZQUNELEdBQUcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDL0IsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBNkIsRUFBRSxVQUFtRSxFQUFFO1FBQ3pILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0MsSUFBSTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUN6QixXQUFXO1lBQ1gsUUFBUTtZQUNSLFlBQVk7WUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDL0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3ZDLEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQzlCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDdEMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztTQUN2QyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQWtCLEVBQUUsR0FBVyxFQUFFLEtBQWE7UUFDekQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxRQUFRO1lBQ1IsSUFBSTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU07WUFDMUMsR0FBRztZQUNILEtBQUs7U0FDTixFQUFFO1lBQ0QsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtTQUMvQixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7Q0FDRjtBQTlMRCxrQkE4TEM7QUFDRCxTQUFTLGdCQUFnQixDQUFDLE1BQTZCO0lBQ3JELE9BQU8sQ0FBQyxLQUFVLEVBQUUsRUFBRTtRQUNwQixNQUFNLEtBQUssR0FBRyxjQUFjLENBQUM7UUFDN0IsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDL0csTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDIn0=
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Kv9xrD1WYPeNDTPUTh8LSmwh8IULZ/3uPahwLB2XgCag
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCTKGeFUYhT/pQ0
// SIG // VZ6d+3uGAZYsvfZHXhUoIkCNL+RGHjBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAGxaH5S+yL1RQiDUDXY56/s+0erTgokj
// SIG // GQlbTQlnQF0jEzp2fhzcGCUy493bfeIIFDjFXIrWnCYb
// SIG // YLxziW4YhzSgPgtwPW2+HFACCzsDzOUJS9H+qTwN8v2t
// SIG // Hj5iXS/HtDPblEmHDT3fQEynqdAL/SPU3NUQYtJlA+Nc
// SIG // XSmqoVDwMNLiIxcUpK8nhP4gqveGdniZDBNuoaLitYwg
// SIG // sfGWDIhzhnU4N8Z9XFAdhC+d7S9tyyjdCTPx+8EWAkwZ
// SIG // igHpLHLvAoMIDRSq82YpRLBoKTmtZ0kOnOHOye1JIFF1
// SIG // A9f1BEe89IGilLfIVYbne1gyS3oT2whWXCGhCNdrj9mm
// SIG // /nKhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // SLyuK5icxeO0LUbE9LF0bX5nFTgE3j9od7+NnP9brw8C
// SIG // BmffBn+nahgTMjAyNTA0MDExOTU5MzguMjMyWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjdGMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAIG17xROJgj7CwAAQAAAgYwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjUwMTMwMTk0MjUwWhcNMjYwNDIyMTk0MjUwWjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjdGMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEA6USFmyDN0Za9/e3Ix2mMfOZeyPmVVhjAgQjPddQa
// SIG // VOviBlgqpLKoKnn2RRIyszVQ2AvWHICEwM9u+jRoLxAp
// SIG // uGXzb/xT8HGkg8+8Ww27DqMW8EKB1DUa6Psebm2YU+li
// SIG // XlPexdOvrw4wMP2Ldb1joEU6pj/3Ta/aKiGxOaAi2HR9
// SIG // 8CP56GJrCVXO/eup/ge1ABgFlNrHty8/sXcZzbDV+Ake
// SIG // syDFSU0nsz/9kkzXMSU7vZNrJe/78zocSYQkN/K3WhKK
// SIG // oRh6165lZBIUr/ktNAzCXNTiF8an28D4zKhFaeyt5JnM
// SIG // wpG7ptQTiCdsLgwGyriXpabXjWY/0ufDUkMOpIX7iQJb
// SIG // qhyt4oJEvzrsePakz/q1Pj0Hjbg/hrawqKRbnEZmp0L8
// SIG // SEhjaMZwat1Hg06qYZumiOxjB7RQ+gzoyZZZR9YFVlz0
// SIG // 8or3/uLTfE5jusiIAeLj9NGx/Y5/3cssUo8T0Npxr2bY
// SIG // Lap76t4d00Y0Z5HPntVwdbmrQ2tc1HEu694qHU6cgE3t
// SIG // oYJFV95uA4UcyOgOEien2yTPYrCx/ABinMporCs2LqQH
// SIG // hUkyddCRBWujIx0GGKIaAhe+0dAgsDDY7xOF3yx7vqij
// SIG // 2PBkH7GXYoEPXJVAIsnRZlbetYcraMWT+y5l284w9FXn
// SIG // Ms2aC+BKrtV7MwbLpQK+S3disHMCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBTtMLCynQxqU/e3MdyMpsqP0gZuEjAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAdtxmTn3vU4U1Lw9vYuLepQ6c
// SIG // SYaVUTJnvlG8mYQRQmYaBk7Yw3aYQAK1NkOtVmIN2FXJ
// SIG // dkXSZuT1G2dmwO+85PqrS8Qvt3TcVbE3HbcTw0kloMAR
// SIG // 8U4+qQpqAzV6JQGLFqbx0BQhw6hHwIgcV9XZml24kz9X
// SIG // dF3374EenbIVHKmh/5hX4w2QMS1NbOh3FYArwUCZSe8R
// SIG // BuYxSnbamqSlnG1B8E1al0BmyJR1QpTSd8qlumd1CR/w
// SIG // hXGIi1f3uvLq05hrYmcRkmG+EgUjwK0602HhzpUCI/+5
// SIG // aFVpn1l9suABlfw/jM8mTMrxcOFci9FYKvehM0CsrXol
// SIG // XgWlRI8UCqNwHD1C0ReFM8/fD9rQjOV2xWd0KI/Ty4N6
// SIG // 4BV69KCRIX4dralK4UyXdd/ouP33pPc1onKLIZcF4Bbt
// SIG // NNmVgVcwEhBbqhA+PKsrpWf9oxiQXLWvhXZNpaD9it6E
// SIG // o+D0EHtTM81WTudgFzuNjB5YZt0h6N/0YUPiNQNDcvvb
// SIG // gHoZEB+i68ZK1Tb2RuH9DwCjG6lHFxu8c5yidMdB2K+W
// SIG // slhmxymUXDm1Pv9+GaS/Ta1znnVQ15kndspSkpf774tU
// SIG // MDSalyZf/oCZEBHraphwFBUJBbXpovDFF0BtsP0Qx118
// SIG // FgIxPqiA2S0P5OM9mdterVmkekQyhxpMHgqA7ULc5B0w
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
// SIG // Tjo3RjAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUABGtH9dfFxzP1TXaigbOEF8TZzfeggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOuWsy8wIhgPMjAyNTA0MDExODQ3
// SIG // MTFaGA8yMDI1MDQwMjE4NDcxMVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA65azLwIBADAHAgEAAgIthDAHAgEA
// SIG // AgIVXzAKAgUA65gErwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBZkcW2z7Gl
// SIG // 1MqGXMLyMU8dedopDYJ1o1bggq4v3wj+d6kOWVfC4SVo
// SIG // bKyoey4OEeEYpii+kxf76A7Rbrp+6vpaNo0VqpwdYAoz
// SIG // SMxqEZZixYRynAWjy00Y1ZGmKhsO6mPEdv6x/+uAKC+8
// SIG // dZ6jm7+l3VhhU/KHe9+AgWphbfR7Xqp9Qbp28q3m1Ef3
// SIG // FuMSOOvGm1+hl8bOIbODR9SolBntruEzwVTIFhF/Usm/
// SIG // p55QORgfTFK1ug10W/Kl96182T0kZJx1FIm67o85ufSX
// SIG // UvclIfd2d2LVmkeW9b+nJnvV7Fi6XLkU6G+Ayercqqv7
// SIG // T45nqqsWWptNtTU/PF5XjWLwMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIG
// SIG // 17xROJgj7CwAAQAAAgYwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgvK8CB6ybA1MXYEDi30DPaeuUvsVp
// SIG // r/B2ajLUZTS46BYwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCDg6PWUiJGenVbSk/hP7mcdlgMuyolzOUdS
// SIG // SDoTSX9L0jCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAACBte8UTiYI+wsAAEAAAIGMCIE
// SIG // IETXJdgdj+uN02o8jnz7wmvy/cjEVjFdfJpFVlhC5T4X
// SIG // MA0GCSqGSIb3DQEBCwUABIICAKZ34XbQ3VDkqdem/O4H
// SIG // piNEBsVIoUl2gW6qcSj5EvY1GY5SLBVmTw92JSNM+ePD
// SIG // deX4VP5Js7pMejfaOxGqxIaZQGsl8LJapbB+pF2YMhbQ
// SIG // dUgyXb9KCuBEf5F6n9M+VoFUjo9AbnKiMUuEJgQcCaOC
// SIG // Q7sf4m0T3g0z59DakXT6usEosCCrohR1KotO0fzxkjz1
// SIG // B4/BRhu5yuS+VFTzrSmDyZq0v+bUzafBHPKro2iyPqRi
// SIG // ouRMzMmqGwv0nsYItxHrU67g09+Xw+guGrpMuYq+DsQO
// SIG // E7ZaHAPXaZ4MJaIb4pxCRwCAk/nCv47hltwqWpbS7Cbk
// SIG // PmKZaY3DpjOkYOvBUbC/cBng9O4jMroTrJpwGuwU4E0U
// SIG // Gv4E38TcRkga4QmlaACOlpNbK1iG9r6HpIto7ljt2Ra0
// SIG // Xs9+vXdkgvPH6IE4aRboIURjHy1wUePNRAVWJXV99He2
// SIG // CzV+ajRCZykVTiyyrvF4nXR9jECrqUqc9wQicEGqtJVo
// SIG // XUbnd1M9RMLRq7RNLChrBCee0NkZna1zpEJqGdk3GrCf
// SIG // aijyjtZ3HtSaKFk8aKMnkfIhT4bjerXW2eQxHVqH1gwr
// SIG // 5M3zqB9xmU+a8aDXYfbvtMkIvG298ip58R5fv0mj6OL/
// SIG // OKBByrw9gImgAZtfX658PMgU3u14JJHPmF+Ux3t9wCIO
// SIG // PDWT
// SIG // End signature block
