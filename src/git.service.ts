import { exec } from "child_process"
import { parseGitRootPathOutput } from "./filename-utils"

export class GitService {
  /**
   * Finds the path of the local git directory.
   * @returns A promise with the directory path
   */
  getRootDirectory(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("git rev-parse --show-toplevel", (error, stdout, stderr) => {
        const succeeded = error || stderr !== ""
        resolve(succeeded ? __dirname : parseGitRootPathOutput(stdout))
      })
    })
  }
}
