import { exec } from "child_process"
import { parseGitRootPathOutput, trimLineEnding } from "./filename-utils"

export class GitService {
  /**
   * Finds the path of the local git directory.
   * @returns A promise with the directory path
   */
  getRootDirectory(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("git rev-parse --show-toplevel", (error, stdout, stderr) => {
        const failed = error || stderr !== ""
        resolve(failed ? __dirname : parseGitRootPathOutput(stdout))
      })
    })
  }

  /**
   * Finds the current git branch.
   * @returns A promise with the current git branch
   */
  getCurrentBranch(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("git rev-parse --abbrev-ref HEAD", (error, stdout, stderr) => {
        const failed = error || stderr !== ""
        resolve(failed ? "master" : trimLineEnding(stdout))
      })
    })
  }
}
