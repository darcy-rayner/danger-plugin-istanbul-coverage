import FilesystemService from "../filesystem.service"
import { parseLcov } from "./parse-lcov"

jest.mock("../filesystem.service")

function setupCoverageFile(coverage: string | undefined) {
  ;(FilesystemService as any).mockImplementation(() => {
    return {
      exists: p => coverage !== undefined,
      read: p => (coverage !== undefined ? coverage : undefined),
    }
  })
}

describe("parseLcov", () => {
  it("can parse a correctly formatted lcov file", () => {
    setupCoverageFile(
      `TN:
SF: some/file.ts
FN: 1, func1
FN: 5, func2
FN: 10, func3
FN: 15, func4
FNDA: 1, func1
FNDA: 3, func2
FNDA: 0, func3
FNDA: 0, func4
FNF: 4
FNH: 2
BRF: 8
BRH: 4
LH: 15
LF: 20
end_of_record`
    )
    const output = parseLcov("randomPath")
    expect(output).toEqual({
      "some/file.ts": {
        lines: { total: 20, covered: 15, skipped: 5, pct: 75 },
        functions: { total: 4, covered: 2, skipped: 2, pct: 50 },
        statements: { total: 20, covered: 15, skipped: 5, pct: 75 },
        branches: { total: 8, covered: 4, skipped: 4, pct: 50 },
      },
    })
  })

  it("outputs an empty collection if there is no end_of_record", () => {
    setupCoverageFile(
      `TN:
SF: some/file.ts
FN: 1, func1
FNDA: 1, func1
FNF: 1
FNH: 1
BRF: 8
BRH: 4
LH: 15
LF: 20`
    )
    const output = parseLcov("randomPath")
    expect(output).toEqual({})
  })

  it("fails to pass if FNF (number of functions) is missing", () => {
    setupCoverageFile(
      `TN:
SF: some/file.ts
FN: 1, func1
FNDA: 1, func1
FNH: 1
BRF: 8
BRH: 4
LH: 15
LF: 20
end_of_record`
    )
    expect(() => parseLcov("randomPath")).toThrow()
  })

  it("can parse a correctly formatted lcov file with two records", () => {
    setupCoverageFile(
      `TN:
SF: some/file1.ts
FN: 1, func1
FNDA: 1, func1
FNH: 1
FNF: 1
BRF: 8
BRH: 4
LH: 15
LF: 20
end_of_record
SF: some/file2.ts
FN: 1, func1
FNDA: 1, func1
FN: 1, func2
FNDA: 1, func2
FNH: 1
FNF: 2
BRF: 8
BRH: 4
LH: 15
LF: 20
end_of_record`
    )
    const output = parseLcov("randomPath")
    expect(output).toEqual({
      "some/file1.ts": {
        lines: { total: 20, covered: 15, skipped: 5, pct: 75 },
        functions: { total: 1, covered: 1, skipped: 0, pct: 100 },
        statements: { total: 20, covered: 15, skipped: 5, pct: 75 },
        branches: { total: 8, covered: 4, skipped: 4, pct: 50 },
      },
      "some/file2.ts": {
        lines: { total: 20, covered: 15, skipped: 5, pct: 75 },
        functions: { total: 2, covered: 1, skipped: 1, pct: 50 },
        statements: { total: 20, covered: 15, skipped: 5, pct: 75 },
        branches: { total: 8, covered: 4, skipped: 4, pct: 50 },
      },
    })
  })

  it("throws an error when the file doesn't exist", () => {
    setupCoverageFile(undefined)
    expect(() => parseLcov("randomPath")).toThrow()
  })
})
