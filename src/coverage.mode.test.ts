import {
  combineEntries,
  combineItems,
  CoverageEntry,
  CoverageItem,
  CoverageModel,
  createEmptyCoverageEntry,
  meetsThreshold,
  parseCoverageModel,
} from "./coverage.model"

describe("combineEntries()", () => {
  it("can add non-zero line counts", () => {
    const entry1: CoverageEntry = {
      lines: { total: 10, covered: 3, skipped: 7, pct: 30 },
      statements: { total: 20, covered: 7, skipped: 13, pct: 35 },
      branches: { total: 40, covered: 23, skipped: 17, pct: 57.5 },
      functions: { total: 50, covered: 25, skipped: 25, pct: 50 },
    }
    const entry2: CoverageEntry = {
      lines: { total: 40, covered: 5, skipped: 35, pct: 12.5 },
      statements: { total: 10, covered: 4, skipped: 6, pct: 40 },
      branches: { total: 6, covered: 3, skipped: 3, pct: 50 },
      functions: { total: 8, covered: 6, skipped: 2, pct: 75 },
    }
    const result = combineEntries(entry1, entry2)
    expect(result).toEqual({
      lines: { total: 50, covered: 8, skipped: 42, pct: 16 },
      statements: { total: 30, covered: 11, skipped: 19, pct: 100 * 11 / 30 },
      branches: { total: 46, covered: 26, skipped: 20, pct: 100 * 26 / 46 },
      functions: { total: 58, covered: 31, skipped: 27, pct: 100 * 31 / 58 },
    })
  })

  it("returns 100% coverage when there is nothing to cover", () => {
    const entry1: CoverageEntry = {
      lines: { total: 0, covered: 0, skipped: 0, pct: 100 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 100 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 100 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 100 },
    }
    const entry2: CoverageEntry = {
      lines: { total: 0, covered: 0, skipped: 0, pct: 100 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 100 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 100 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 100 },
    }
    const result = combineEntries(entry1, entry2)
    expect(result).toEqual({
      lines: { total: 0, covered: 0, skipped: 0, pct: 100 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 100 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 100 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 100 },
    })
  })
})

describe("meetsThreshold()", () => {

  const entry = Object.freeze({
    lines: { total: 100, covered: 50, skipped: 50, pct: 50 },
    statements: { total: 100, covered: 50, skipped: 50, pct: 50 },
    branches: { total: 100, covered: 50, skipped: 50, pct: 50 },
    functions: { total: 100, covered: 50, skipped: 50, pct: 50 },
  })

  it("returns false when lines percentage below threshold", () => {
    const result = meetsThreshold(entry, { lines: 80, statements: 40, branches: 40, functions: 40 })
    expect(result).toBe(false)
  })
  it("returns false when statements percentage below threshold", () => {
    const result = meetsThreshold(entry, { lines: 40, statements: 80, branches: 40, functions: 40 })
    expect(result).toBe(false)
  })
  it("returns false when branches percentage above threshold", () => {
    const result = meetsThreshold(entry, { lines: 40, statements: 40, branches: 80, functions: 40 })
    expect(result).toBe(false)
  })
  it("returns false when functions percentage above threshold", () => {
    const result = meetsThreshold(entry, { lines: 40, statements: 40, branches: 40, functions: 80 })
    expect(result).toBe(false)
  })
  it("returns true when all coverage above thresholds", () => {
    const result = meetsThreshold(entry, { lines: 40, statements: 40, branches: 40, functions: 40 })
    expect(result).toBe(true)
  })
  it("returns true when all coverage equal to thresholds", () => {
    const result = meetsThreshold(entry, { lines: 50, statements: 50, branches: 50, functions: 50 })
    expect(result).toBe(true)
  })
})
