import { SortMethod } from "./config.model"
import {
  combineEntries,
  CoverageCollection,
  CoverageEntry,
  CoverageItem,
  CoverageModel,
  makeCoverageModel,
  meetsThreshold,
  parseCoverageCollection,
  sortFiles,
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

describe("makeCoverageModel", () => {
  const files = ["file1", "file2", "file3", "file4"]
  const coverage: CoverageCollection = {
    file1: {
      lines: { total: 100, covered: 50, skipped: 50, pct: 50 },
      functions: { total: 100, covered: 50, skipped: 50, pct: 50 },
      statements: { total: 100, covered: 50, skipped: 50, pct: 50 },
      branches: { total: 100, covered: 50, skipped: 50, pct: 50 },
    },
    file2: {
      lines: { total: 100, covered: 60, skipped: 40, pct: 60 },
      functions: { total: 100, covered: 60, skipped: 40, pct: 60 },
      statements: { total: 100, covered: 60, skipped: 40, pct: 60 },
      branches: { total: 100, covered: 60, skipped: 40, pct: 60 },
    },
    file3: {
      lines: { total: 100, covered: 70, skipped: 30, pct: 70 },
      functions: { total: 100, covered: 70, skipped: 30, pct: 70 },
      statements: { total: 100, covered: 70, skipped: 30, pct: 70 },
      branches: { total: 100, covered: 70, skipped: 30, pct: 70 },
    },
    file4: {
      lines: { total: 100, covered: 80, skipped: 20, pct: 80 },
      functions: { total: 100, covered: 80, skipped: 20, pct: 80 },
      statements: { total: 100, covered: 80, skipped: 20, pct: 80 },
      branches: { total: 100, covered: 80, skipped: 20, pct: 80 },
    },
  }

  it("calculates the average of the final two elided entries", () => {
    const output = makeCoverageModel(2, files, coverage)
    expect(output.elidedCount).toEqual(2)
    expect(output.elided).toEqual({
      lines: { total: 200, covered: 150, skipped: 50, pct: 75 },
      functions: { total: 200, covered: 150, skipped: 50, pct: 75 },
      statements: { total: 200, covered: 150, skipped: 50, pct: 75 },
      branches: { total: 200, covered: 150, skipped: 50, pct: 75 },
    })
  })

  it("doesn't elide when total number of files is equal to numberOfEntries to display", () => {
    const output = makeCoverageModel(4, files, coverage)
    expect(output.elidedCount).toEqual(0)
    expect(output.elided).toEqual({
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
    })
  })
})

describe("sortFiles", () => {
  const coverage = {
    file1: {
      lines: { total: 50, covered: 25, skipped: 25, pct: 50 },
      functions: { total: 100, covered: 50, skipped: 50, pct: 50 },
      statements: { total: 100, covered: 50, skipped: 50, pct: 50 },
      branches: { total: 100, covered: 50, skipped: 50, pct: 50 },
    },
    file2: {
      lines: { total: 150, covered: 60, skipped: 40, pct: 60 },
      functions: { total: 100, covered: 60, skipped: 40, pct: 60 },
      statements: { total: 100, covered: 60, skipped: 40, pct: 60 },
      branches: { total: 100, covered: 60, skipped: 40, pct: 60 },
    },
    file3: {
      lines: { total: 100, covered: 700, skipped: 300, pct: 70 },
      functions: { total: 100, covered: 70, skipped: 30, pct: 70 },
      statements: { total: 100, covered: 70, skipped: 30, pct: 70 },
      branches: { total: 100, covered: 70, skipped: 30, pct: 70 },
    },
  }
  it("sorts files by their line coverage percentage in descending order", () => {
    const output = sortFiles(["file1", "file2", "file3"], coverage, SortMethod.MostCoverage)
    expect(output).toEqual(["file3", "file2", "file1"])
  })
  it("sorts files by their line coverage percentage in ascending order", () => {
    const output = sortFiles(["file1", "file2", "file3"], coverage, SortMethod.LeastCoverage)
    expect(output).toEqual(["file1", "file2", "file3"])
  })
  it("skips files not in input file list", () => {
    const output = sortFiles(["file1", "file3"], coverage, SortMethod.MostCoverage)
    expect(output).toEqual(["file3", "file1"])
  })
  it("sorts files by the number of lines in descending order", () => {
    const output = sortFiles(["file1", "file2", "file3"], coverage, SortMethod.LargestFileSize)
    expect(output).toEqual(["file2", "file3", "file1"])
  })
  it("sorts files the number of lines in ascending order", () => {
    const output = sortFiles(["file1", "file2", "file3"], coverage, SortMethod.SmallestFileSize)
    expect(output).toEqual(["file1", "file3", "file2"])
  })
  it("sorts files by the number of uncovered lines in descending order", () => {
    const output = sortFiles(["file1", "file2", "file3"], coverage, SortMethod.UncoveredLines)
    expect(output).toEqual(["file3", "file2", "file1"])
  })

  it("sorts files in alphabetical order", () => {
    const output = sortFiles(["c", "b", "a"], coverage, SortMethod.Alphabetically)
    expect(output).toEqual(["a", "b", "c"])
  })
})
