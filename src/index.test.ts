import * as path from "path"
import { ReportMode } from "./config.model"
import FilesystemService from "./filesystem.service"
import { GitService } from "./git.service"
import { istanbulCoverage } from "./index"
jest.mock("./filesystem.service")
jest.mock("./git.service")

/* tslint:disable max-line-length */

declare const global: any

const basePath = "/some/random/path/to/repo"

function makeCoverageEntry(coverage: number) {
  return `{
      "0": ${coverage < 25 ? 0 : 1},
      "1": ${coverage < 50 ? 0 : 1},
      "2": ${coverage < 75 ? 0 : 1},
      "3":  ${coverage < 100 ? 0 : 1}
    }`
}

function makeEntry(
  fileName: string,
  lineCoverage = 100,
  statementCoverage = 100,
  functionCoverage = 100,
  branchCoverage = 100
) {
  return `
    "${fileName}": {
      "lines": { "total": 100, "covered": ${lineCoverage}, "skipped": 0, "pct": ${lineCoverage} },
      "functions": { "total": 100, "covered": ${functionCoverage}, "skipped": 0, "pct": ${functionCoverage} },
      "statements": { "total": 100, "covered": ${statementCoverage}, "skipped": 0, "pct": ${statementCoverage} },
      "branches": { "total": 100, "covered": ${branchCoverage}, "skipped": 0, "pct": ${branchCoverage} }
    }
  `
}

function setupGitService() {
  ;(GitService as any).mockImplementation(() => {
    return {
      getRootDirectory: () => Promise.resolve(__dirname),
      getCurrentCommit: () => Promise.resolve("master"),
    }
  })
}

function setupCoverageFile(coverage?: string) {
  ;(FilesystemService as any).mockImplementation(() => {
    return {
      exists: p => coverage !== undefined,
      read: p => {
        return coverage !== undefined ? Buffer.from(coverage, "utf8") : undefined
      },
    }
  })
}

describe("istanbulCoverage()", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
    global.danger = {
      git: {
        modified_files: ["src/modified-file1.ts", "src/modified-file2.ts"],
        created_files: ["src/created-file1.ts", "src/created-file2.ts"],
      },
    }
    setupGitService()
    setupCoverageFile(`{
      ${makeEntry("total", 50, 50, 50, 50)},
      ${makeEntry(`${__dirname}/src/modified-file1.ts`, 66, 25, 25, 25)},
      ${makeEntry(`${__dirname}/src/modified-file2.ts`, 99, 50, 75, 50)},
      ${makeEntry(`${__dirname}/src/created-file1.ts`, 66, 100, 25, 50)},
      ${makeEntry(`${__dirname}/src/created-file2.ts`, 99, 75, 50, 25)},
      ${makeEntry(`${__dirname}/src/unmodified-field.ts`, 25, 25, 25, 25)}
    }`)
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
    jest.resetAllMocks()
  })

  it('will only report on new files when reportFileSet is set to "created"', async () => {
    await istanbulCoverage({
      reportFileSet: "created",
    })
    expect(global.markdown).toHaveBeenCalledWith(
      `## Coverage in New Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created\\-file1.ts](../blob/master/src/created\\-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created\\-file2.ts](../blob/master/src/created\\-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
Total | (165/200) 83% | (175/200) 88% | (75/200) 38% | (75/200) 38%
`
    )
  })

  it('will only report on modified files when reportFileSet is set to "modified"', async () => {
    await istanbulCoverage({
      reportFileSet: "modified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
      `## Coverage in Modified Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/modified\\-file1.ts](../blob/master/src/modified\\-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified\\-file2.ts](../blob/master/src/modified\\-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
Total | (165/200) 83% | (75/200) 38% | (100/200) 50% | (75/200) 38%
`
    )
  })
  it('will only report on created and modified files when reportFileSet is set to "createdOrModified"', async () => {
    await istanbulCoverage({
      reportFileSet: "createdOrModified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
      `## Coverage in Created or Modified Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created\\-file1.ts](../blob/master/src/created\\-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created\\-file2.ts](../blob/master/src/created\\-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
[src/modified\\-file1.ts](../blob/master/src/modified\\-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified\\-file2.ts](../blob/master/src/modified\\-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
Total | (330/400) 83% | (250/400) 63% | (175/400) 44% | (150/400) 38%
`
    )
  })

  it('will report all files when reportFileSet is set to "all"', async () => {
    await istanbulCoverage({
      reportFileSet: "all",
    })
    expect(global.markdown).toHaveBeenCalledWith(
      `## Coverage in All Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created\\-file1.ts](../blob/master/src/created\\-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created\\-file2.ts](../blob/master/src/created\\-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
[src/modified\\-file1.ts](../blob/master/src/modified\\-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified\\-file2.ts](../blob/master/src/modified\\-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
[src/unmodified\\-field.ts](../blob/master/src/unmodified\\-field.ts) | (25/100) 25% | (25/100) 25% | (25/100) 25% | (25/100) 25%
Total | (355/500) 71% | (275/500) 55% | (200/500) 40% | (175/500) 35%
`
    )
  })

  it("will only show the maximum number of entries", async () => {
    await istanbulCoverage({
      reportFileSet: "all",
      numberOfEntries: 3,
    })
    expect(global.markdown).toHaveBeenCalledWith(
      `## Coverage in All Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created\\-file1.ts](../blob/master/src/created\\-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created\\-file2.ts](../blob/master/src/created\\-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
[src/modified\\-file1.ts](../blob/master/src/modified\\-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
Other (2 more) | (124/200) 62% | (75/200) 38% | (100/200) 50% | (75/200) 38%
Total | (355/500) 71% | (275/500) 55% | (200/500) 40% | (175/500) 35%
`
    )
  })

  it("fails the build when reportMode is set to FAIL and coverage is below threshold", async () => {
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
    })
    expect(global.fail).toBeCalled()
  })

  it("passes the build when reportMode is set to FAIL and coverage is above threshold", async () => {
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.fail).not.toBeCalled()
  })

  it("warns the build when reportMode is set to WARN and coverage is below threshold", async () => {
    await istanbulCoverage({
      reportMode: ReportMode.Warn,
    })
    expect(global.warn).toBeCalled()
  })

  it("passes the build when reportMode is set to WARN and coverage is above threshold", async () => {
    await istanbulCoverage({
      reportMode: ReportMode.Warn,
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.warn).not.toBeCalled()
  })

  it("logs the custom success message if one is specified and coverage is above threshold", async () => {
    const customMessage = "This is the custom message"
    await istanbulCoverage({
      reportMode: ReportMode.Message,
      customSuccessMessage: customMessage,
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.message).toBeCalledWith(customMessage)
  })

  it("logs the custom failure message if one is specified and coverage is below threshold", async () => {
    const customMessage = "This is the custom message"
    await istanbulCoverage({
      reportMode: ReportMode.Message,
      customFailureMessage: customMessage,
    })
    expect(global.message).toBeCalledWith(customMessage)
  })

  it('doesn\'t output anything when reportFileSet is set to "created" and there are no created files ', async () => {
    global.danger.git.created_files = []
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
      reportFileSet: "created",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })

  it('doesn\'t output anything when reportFileSet is set to "modified" and there are no modified files ', async () => {
    global.danger.git.modified_files = []
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
      reportFileSet: "modified",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })
  it("doesn't output anything when the coverage data is empty", async () => {
    setupCoverageFile("{}")
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })
  it("outputs a warning when it can't find the coverage file", async () => {
    setupCoverageFile(undefined)
    await istanbulCoverage({
      reportMode: ReportMode.Warn,
    })
    expect(global.warn).toBeCalled()
  })
  it("outputs a warning when coverage file is invalidly formatted", async () => {
    setupCoverageFile("{")
    await istanbulCoverage({
      reportMode: ReportMode.Fail,
    })
    expect(global.warn).toBeCalled()
  })
})
