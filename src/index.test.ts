import * as path from "path"
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

  it('will only report on new files when reportFileSet is set to "created"', done => {
    istanbulCoverage({
      reportFileSet: "created",
    }).then(() => {
      expect(global.markdown).toHaveBeenCalledWith(
        `## Coverage in New Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created\\-file1.ts](../blob/master/src/created\\-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created\\-file2.ts](../blob/master/src/created\\-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
Total | (165/200) 83% | (175/200) 88% | (75/200) 38% | (75/200) 38%
`
      )
      done()
    })
  })

  it('will only report on modified files when reportFileSet is set to "modified"', done => {
    istanbulCoverage({
      reportFileSet: "modified",
    }).then(() => {
      expect(global.markdown).toHaveBeenCalledWith(
        `## Coverage in Modified Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/modified\\-file1.ts](../blob/master/src/modified\\-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified\\-file2.ts](../blob/master/src/modified\\-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
Total | (165/200) 83% | (75/200) 38% | (100/200) 50% | (75/200) 38%
`
      )
      done()
    })
  })
  it('will only report on created and modified files when reportFileSet is set to "createdOrModified"', done => {
    istanbulCoverage({
      reportFileSet: "createdOrModified",
    }).then(() => {
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
      done()
    })
  })

  it('will report all files when reportFileSet is set to "all"', done => {
    istanbulCoverage({
      reportFileSet: "all",
    }).then(() => {
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
      done()
    })
  })

  it("fails the build when reportMode is set to FAIL and coverage is below threshold", done => {
    istanbulCoverage({
      reportMode: "fail",
    }).then(() => {
      expect(global.fail).toBeCalled()
      done()
    })
  })

  it("passes the build when reportMode is set to FAIL and coverage is above threshold", done => {
    istanbulCoverage({
      reportMode: "fail",
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    }).then(() => {
      expect(global.fail).not.toBeCalled()
      done()
    })
  })

  it("warns the build when reportMode is set to WARN and coverage is below threshold", done => {
    istanbulCoverage({
      reportMode: "warn",
    }).then(() => {
      expect(global.warn).toBeCalled()
      done()
    })
  })

  it("passes the build when reportMode is set to WARN and coverage is above threshold", done => {
    istanbulCoverage({
      reportMode: "warn",
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    }).then(() => {
      expect(global.warn).not.toBeCalled()
      done()
    })
  })

  it("logs the custom success message if one is specified and coverage is above threshold", done => {
    const customMessage = "This is the custom message"
    istanbulCoverage({
      reportMode: "message",
      customSuccessMessage: customMessage,
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    }).then(() => {
      expect(global.message).toBeCalledWith(customMessage)
      done()
    })
  })

  it("logs the custom failure message if one is specified and coverage is below threshold", done => {
    const customMessage = "This is the custom message"
    istanbulCoverage({
      reportMode: "message",
      customFailureMessage: customMessage,
    }).then(() => {
      expect(global.message).toBeCalledWith(customMessage)
      done()
    })
  })

  it('doesn\'t output anything when reportFileSet is set to "created" and there are no created files ', done => {
    global.danger.git.created_files = []
    istanbulCoverage({
      reportMode: "fail",
      reportFileSet: "created",
    }).then(() => {
      expect(global.fail).not.toBeCalled()
      expect(global.warn).not.toBeCalled()
      expect(global.message).not.toBeCalled()
      done()
    })
  })

  it('doesn\'t output anything when reportFileSet is set to "modified" and there are no modified files ', done => {
    global.danger.git.modified_files = []
    istanbulCoverage({
      reportMode: "fail",
      reportFileSet: "modified",
    }).then(() => {
      expect(global.fail).not.toBeCalled()
      expect(global.warn).not.toBeCalled()
      expect(global.message).not.toBeCalled()
      done()
    })
  })
  it("doesn't output anything when the coverage data is empty", done => {
    setupCoverageFile("{}")
    istanbulCoverage({
      reportMode: "fail",
    }).then(() => {
      expect(global.fail).not.toBeCalled()
      expect(global.warn).not.toBeCalled()
      expect(global.message).not.toBeCalled()
      done()
    })
  })
  it("outputs a warning when it can't find the coverage file", done => {
    setupCoverageFile(undefined)
    istanbulCoverage({
      reportMode: "warn",
    }).then(() => {
      expect(global.warn).toBeCalled()
      done()
    })
  })
  it("outputs a warning when coverage file is invalidly formatted", done => {
    setupCoverageFile("{")
    istanbulCoverage({
      reportMode: "fail",
    }).then(() => {
      expect(global.warn).toBeCalled()
      done()
    })
  })
})
