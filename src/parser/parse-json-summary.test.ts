import FilesystemService from "../filesystem.service"
import parseJsonSummary from "./parse-json-summary"

jest.mock("../filesystem.service")

function setupCoverageFile(coverage: string | undefined) {
  ;(FilesystemService as any).mockImplementation(() => {
    return {
      exists: p => coverage !== undefined,
      read: p => (coverage !== undefined ? Buffer.from(coverage, "utf8") : undefined),
    }
  })
}

describe("parseJsonSummary", () => {
  it("parses a correctly formatted json object", () => {
    setupCoverageFile(`
    {
      "f1": {
        "lines": { "total": 100, "covered": 0, "skipped": 0, "pct": 0 },
        "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 },
        "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 },
        "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 }
      }
    }
    `)
    const output = parseJsonSummary("randomName")
    expect(output).toEqual({
      f1: {
        lines: { total: 100, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 100, covered: 1, skipped: 0, pct: 1 },
        statements: { total: 100, covered: 2, skipped: 0, pct: 2 },
        branches: { total: 100, covered: 3, skipped: 0, pct: 3 },
      },
    })
  })

  it("throws an error when the file is invalid json", () => {
    setupCoverageFile(`
    {`) // Missing a closing brace
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when the file doesn't exist", () => {
    setupCoverageFile(undefined) // Missing a closing brace
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when coverage entry isn't object ", () => {
    setupCoverageFile(`{
      "f1": [
        { "lines": { "total": 100, "covered": 0, "skipped": 0, "pct": 0 } },
        { "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 } },
        { "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 } },
        { "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 } }
      ]
    }`) // Uses an array, instead of key/value lookup
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when coverage entry is missing 'lines' property ", () => {
    setupCoverageFile(`{
      "f1": {
        "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 },
        "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 },
        "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 }
      }
    }`) // Uses an array, instead of key/value lookup
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when coverage item isn't an object ", () => {
    setupCoverageFile(`{
      "f1": {
        "lines": "not an object",
        "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 },
        "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 },
        "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 }
      }
    }`) // Uses an array, instead of key/value lookup
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when coverage item is missing 'total' property ", () => {
    setupCoverageFile(`{
      "f1": {
        "lines": { "covered": 1, "skipped": 0, "pct": 1 },
        "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 },
        "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 },
        "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 }
      }
    }`) // Uses an array, instead of key/value lookup
    expect(() => parseJsonSummary("randomName")).toThrow()
  })

  it("throws an error when coverage item is missing has non number property ", () => {
    setupCoverageFile(`{
      "f1": {
        "lines": { "total": "this-is-an-invalid-string", "covered": 1, "skipped": 0, "pct": 1 },
        "functions": { "total": 100, "covered": 1, "skipped": 0, "pct": 1 },
        "statements": { "total": 100, "covered": 2, "skipped": 0, "pct": 2 },
        "branches": { "total": 100, "covered": 3, "skipped": 0, "pct": 3 }
      }
    }`) // Uses an array, instead of key/value lookup
    expect(() => parseJsonSummary("randomName")).toThrow()
  })
})
