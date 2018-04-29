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
})
