import { exec } from "child_process"
import * as util from "util"
import { parseGitRootPathOutput } from "./filename-utils"

export class GitService {
  /**
   * Finds the path of the local git directory.
   * @returns A promise with the directory path
   */
  getRootDirectory(): Promise<string> {
    const promiseExec = util.promisify(exec)
    return promiseExec("git rev-parse --show-toplevel")
      .then(output => {
        return output.stderr !== "" ? __dirname : parseGitRootPathOutput(output.stdout)
      })
      .catch(error => {
        return __dirname
      })
  }
}
