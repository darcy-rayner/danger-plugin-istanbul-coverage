import * as path from "path"
import FilesystemService from "./filesystem.service"
import { karmaInstanbul, KarmaInstanbulConfig } from "./index"
jest.mock("./filesystem.service")

declare const global: any

const basePath = "/some/random/path/to/repo"

function makeCoverageEntry(coverage) {
  return `{
      "0": ${ coverage < 25 ? 0 : 1 },
      "1": ${ coverage < 50 ? 0 : 1},
      "2": ${ coverage < 75 ? 0 : 1 },
      "3":  ${ coverage < 100 ? 0 : 1 }
    }`
}

function makeEntry(fileName: string, statementCoverage: number = 100, functionCoverage: number = 100,
                   branchCoverage: number = 100) {
  return `
    "${fileName}: {
      "path": "${fileName}",
      "statementMap": {
        "0": { "start": {"line": 0, "column": 3 }, "end": { "line": 3, "column": 35 } },
        "1": { "start": {"line": 10, "column": 3 }, "end": { "line": 13, "column": 35 } },
        "2": { "start": {"line": 20, "column": 3 }, "end": { "line": 23, "column": 35 } },
        "3": { "start": {"line": 30, "column": 3 }, "end": { "line": 33, "column": 35 } }
      },
      "fnMap": {
        "0": {
          "name": "someFunction1",
          "decl": { "start": {"line": 1, "column": 3 }, "end": { "line": 4, "column": 35 } },
          "loc": { "start": {"line": 1, "column": 3 }, "end": { "line": 4, "column": 35 } },
        },
        "1": {
          "name": "someFunction2",
          "decl": { "start": {"line": 11, "column": 3 }, "end": { "line": 14, "column": 35 } },
          "loc": { "start": {"line": 11, "column": 3 }, "end": { "line": 14, "column": 35 } },
        },
        "2": {
          "name": "someFunction3",
          "decl": { "start": {"line": 21, "column": 3 }, "end": { "line": 24, "column": 35 } },
          "loc": { "start": {"line": 21, "column": 3 }, "end": { "line": 24, "column": 35 } },
        },
        "3": {
          "name": "someFunction4",
          "decl": { "start": {"line": 31, "column": 3 }, "end": { "line": 34, "column": 35 } },
          "loc": { "start": {"line": 31, "column": 3 }, "end": { "line": 34, "column": 35 } },
        }
      },
      "branchMap": {
        "0": {
          "loc": {
            "start": {"line": 2, "column": 3 }, "end": { "line": 5, "column": 35 }
          },
          "type": "if",
          "locations": [
            { "start": {"line": 2, "column": 3 }, "end": { "line": 5, "column": 35 } },
            { "start": {"line": 2, "column": 3 }, "end": { "line": 5, "column": 35 } }
          ]
        },
        "1": {
          "loc": {
            "start": {"line": 12, "column": 3 }, "end": { "line": 15, "column": 35 }
          },
          "type": "if",
          "locations": [
            { "start": {"line": 12, "column": 3 }, "end": { "line": 15, "column": 35 } },
            { "start": {"line": 12, "column": 3 }, "end": { "line": 15, "column": 35 } }
          ]
        },
        "2": {
          "loc": {
            "start": {"line": 22, "column": 3 }, "end": { "line": 25, "column": 35 }
          },
          "type": "if",
          "locations": [
            { "start": {"line": 22, "column": 3 }, "end": { "line": 25, "column": 35 } },
            { "start": {"line": 22, "column": 3 }, "end": { "line": 25, "column": 35 } }
          ]
        },
        "3": {
          "loc": {
            "start": {"line": 32, "column": 3 }, "end": { "line": 35, "column": 35 }
          },
          "type": "if",
          "locations": [
            { "start": {"line": 32, "column": 3 }, "end": { "line": 35, "column": 35 } },
            { "start": {"line": 32, "column": 3 }, "end": { "line": 35, "column": 35 } }
          ]
        }
      },
      "s": ${makeCoverageEntry(statementCoverage)},
      "f": ${makeCoverageEntry(functionCoverage)},
      "b": ${makeCoverageEntry(branchCoverage)},
    }
  `
}

function setupCoverageFile(coverage?: string) {
  (FilesystemService as any).mockImplementation( () => {
    return {
      exists: (p) => coverage !== undefined,
      read: (p) => {
        return coverage !== undefined ? Buffer.from("coverage", "utf8") : undefined
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
      ${makeEntry(`${basePath}/src/modified-file1.ts`, 25, 25, 25)},
      ${makeEntry(`${basePath}/src/modified-file2.ts`, 50, 75, 50)},
      ${makeEntry(`${basePath}/src/created-file1.ts`, 100, 25, 50)},
      ${makeEntry(`${basePath}/src/created-file2.ts`, 75, 50, 25)},
      ${makeEntry(`${basePath}/src/unmodified-field.ts`, 25, 25, 25)},
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
File | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------------ | ----------------- | ---------------
[src/created-file1.ts](src/created-file1.ts) | 100% | 25% | 50%
[src/created-file2.ts](src/created-file2.ts) | 75% | 50% | 25%
`,
    )
  })

  it("will only report on modified files when reportChangeType is set to \"modified\"", () => {
    karmaInstanbul({
      reportChangeType: "modified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in New and Modified Files
File | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------------ | ----------------- | ---------------
[src/modified-file1.ts](src/modified-file1.ts) | 25% | 25% | 25%
[src/modified-file2.ts](src/modified-file2.ts) | 50% | 75% | 50%
`,
    )
  })
  it("will only report on created and modified files when reportChangeType is set to \"createdOrModified\"", () => {
    karmaInstanbul({
      reportChangeType: "createdOrModified",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in Modified Files
File | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------------ | ----------------- | ---------------
[src/modified-file1.ts](src/modified-file1.ts) | 25% | 25% | 25%
[src/modified-file2.ts](src/modified-file2.ts) | 50% | 75% | 50%
[src/created-file1.ts](src/created-file1.ts) | 100% | 25% | 50%
[src/created-file2.ts](src/created-file2.ts) | 75% | 50% | 25%
`,
    )
  })

  it("will report all files when reportChangeType is set to \"all\"", () => {
    karmaInstanbul({
      reportChangeType: "all",
    })
    expect(global.markdown).toHaveBeenCalledWith(
`## Coverage in All Files
File | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------------ | ----------------- | ---------------
[src/modified-file1.ts](src/modified-file1.ts) | 25% | 25% | 25%
[src/modified-file2.ts](src/modified-file2.ts) | 50% | 75% | 50%
[src/created-file1.ts](src/created-file1.ts) | 100% | 25% | 50%
[src/created-file2.ts](src/created-file2.ts) | 75% | 50% | 25%
[src/unmodified-field.ts](src/unmodified-field.ts)| 25% | 25% | 25%
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
        statements: 25,
        functions: 25,
        branches: 25,
      },
    })
    expect(global.warn).not.toBeCalled()
  })
  it("doesn't output anything when reportChangeType is set to \"created\" and there are no created files ", () => {
    global.danger.created_files = []
    karmaInstanbul({
      reportMode: "fail",
      reportChangeType: "created",
    })
    expect(global.fail).not.toBeCalled()
    expect(global.warn).not.toBeCalled()
    expect(global.message).not.toBeCalled()
  })

  it("doesn't output anything when reportChangeType is set to \"modified\" and there are no modified files ", () => {
    global.danger.modified_files = []
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
})
