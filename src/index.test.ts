import * as path from "path"
import FilesystemService from "./filesystem.service"
import { karmaInstanbul } from "./index"
jest.mock("./filesystem.service")

declare const global: any

const basePath = "/some/random/path/to/repo"

function makeCoverageEntry(coverage: number) {
  return `{
      "0": ${ coverage < 25 ? 0 : 1 },
      "1": ${ coverage < 50 ? 0 : 1},
      "2": ${ coverage < 75 ? 0 : 1 },
      "3":  ${ coverage < 100 ? 0 : 1 }
    }`
}

function makeEntry(fileName: string, lineCoverage = 100, statementCoverage = 100, functionCoverage = 100,
                   branchCoverage = 100) {
  return `
    "${fileName}": {
      "lines": { "total": 100, "covered": ${lineCoverage}, "skipped": 0, "pct": ${lineCoverage} },
      "functions": { "total": 100, "covered": ${functionCoverage}, "skipped": 0, "pct": ${functionCoverage} },
      "statements": { "total": 100, "covered": ${statementCoverage}, "skipped": 0, "pct": ${statementCoverage} },
      "branches": { "total": 100, "covered": ${branchCoverage}, "skipped": 0, "pct": ${branchCoverage} }
    }
  `
}

function setupCoverageFile(coverage?: string) {
  (FilesystemService as any).mockImplementation( () => {
    return {
      exists: (p) => coverage !== undefined,
      read: (p) => {
        return coverage !== undefined ? Buffer.from(coverage, "utf8") : undefined
      },
    }
  })
}

describe("karmaInstanbul()", () => {

  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
    global.danger = {
      git: {
        modified_files: [
          "src/modified-file1.ts",
          "src/modified-file2.ts",
        ],
        created_files: [
          "src/created-file1.ts",
          "src/created-file2.ts",
        ],
      },
    }
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

  it("will only report on new files when reportChangeType is set to \"created\"", () => {
    karmaInstanbul({
      reportChangeType: "created",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in New Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created-file1.ts](src/created-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created-file2.ts](src/created-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
Total | (165/200) 83% | (175/200) 88% | (75/200) 38% | (75/200) 38%
`,
    )
  })

  it("will only report on modified files when reportChangeType is set to \"modified\"", () => {
    karmaInstanbul({
      reportChangeType: "modified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in Modified Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/modified-file1.ts](src/modified-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified-file2.ts](src/modified-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
Total | (165/200) 83% | (75/200) 38% | (100/200) 50% | (75/200) 38%
`,
    )
  })
  it("will only report on created and modified files when reportChangeType is set to \"createdOrModified\"", () => {
    karmaInstanbul({
      reportChangeType: "createdOrModified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in Created or Modified Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created-file1.ts](src/created-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created-file2.ts](src/created-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
[src/modified-file1.ts](src/modified-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified-file2.ts](src/modified-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
Total | (330/400) 83% | (250/400) 63% | (175/400) 44% | (150/400) 38%
`,
    )
  })

  it("will report all files when reportChangeType is set to \"all\"", () => {
    karmaInstanbul({
      reportChangeType: "all",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in All Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[src/created-file1.ts](src/created-file1.ts) | (66/100) 66% | (100/100) 100% | (25/100) 25% | (50/100) 50%
[src/created-file2.ts](src/created-file2.ts) | (99/100) 99% | (75/100) 75% | (50/100) 50% | (25/100) 25%
[src/modified-file1.ts](src/modified-file1.ts) | (66/100) 66% | (25/100) 25% | (25/100) 25% | (25/100) 25%
[src/modified-file2.ts](src/modified-file2.ts) | (99/100) 99% | (50/100) 50% | (75/100) 75% | (50/100) 50%
[src/unmodified-field.ts](src/unmodified-field.ts) | (25/100) 25% | (25/100) 25% | (25/100) 25% | (25/100) 25%
Total | (355/500) 71% | (275/500) 55% | (200/500) 40% | (175/500) 35%
`,
    )
  })

  it("fails the build when reportMode is set to FAIL and coverage is below threshold", () => {
    karmaInstanbul({
      reportMode: "fail",
    })
    expect(global.fail).toBeCalled()
  })

  it("passes the build when reportMode is set to FAIL and coverage is above threshold", () => {
    karmaInstanbul({
      reportMode: "fail",
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.fail).not.toBeCalled()
  })

  it("warns the build when reportMode is set to WARN and coverage is below threshold", () => {
    karmaInstanbul({
      reportMode: "warn",
    })
    expect(global.warn).toBeCalled()
  })

  it("passes the build when reportMode is set to WARN and coverage is above threshold", () => {
    karmaInstanbul({
      reportMode: "warn",
      threshold: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.warn).not.toBeCalled()
  })
  it("doesn't output anything when reportChangeType is set to \"created\" and there are no created files ", () => {
    global.danger.git.created_files = []
    karmaInstanbul({
      reportMode: "fail",
      reportChangeType: "created",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })

  it("doesn't output anything when reportChangeType is set to \"modified\" and there are no modified files ", () => {
    global.danger.git.modified_files = []
    karmaInstanbul({
      reportMode: "fail",
      reportChangeType: "modified",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })
  it("doesn't output anything when the coverage data is empty", () => {
    setupCoverageFile("{}")
    karmaInstanbul({
      reportMode: "fail",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })
  it("outputs a warning when it can't find the coverage file", () => {
    setupCoverageFile(undefined)
    karmaInstanbul({
      reportMode: "fail",
    })
    expect(global.warn).toBeCalled()
  })

  it("escapes filenames with '|,(,),[,],#,*>' characters", () => {
    setupCoverageFile(`{
      ${makeEntry(`${__dirname}/src/file-with-characters[(|#*)].ts`, 25, 25, 25, 25)}
    }`)
    karmaInstanbul()
    const expectedFilename = `src/file-with-characters\\[\\(\\|\\#\\*\\)\\].ts`
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in All Files
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------: | -----------------: | ----------------: | --------------:
[${expectedFilename}](${expectedFilename}) | (25/100) 25% | (25/100) 25% | (25/100) 25% | (25/100) 25%
Total | (25/100) 25% | (25/100) 25% | (25/100) 25% | (25/100) 25%
`,
    )
  })
})
