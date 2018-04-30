import { METHODS } from "http"
import * as path from "path"
import { Config, CoverageThreshold, SortMethod } from "./config.model"
import FilesystemService from "./filesystem.service"

export interface CoverageItem {
  total: number
  covered: number
  skipped: number
  pct: number
}

export interface CoverageEntry {
  lines: CoverageItem
  functions: CoverageItem
  statements: CoverageItem
  branches: CoverageItem
}

export interface CoverageCollection {
  [key: string]: CoverageEntry
}

export interface CoverageModel {
  total: CoverageEntry
  elided: CoverageEntry
  elidedCount: number
  displayed: CoverageCollection
}

function combineItems(first: CoverageItem, second: CoverageItem): CoverageItem {
  const percentage =
    second.covered + first.covered > 0 ? 100 * (first.covered + second.covered) / (second.total + first.total) : 100
  return {
    total: first.total + second.total,
    covered: first.covered + second.covered,
    skipped: first.skipped + second.skipped,
    pct: percentage,
  }
}

function reduceEntries(entries: CoverageEntry[]): CoverageEntry {
  return entries.reduce((cumulativeEntry, entry) => combineEntries(cumulativeEntry, entry), createEmptyCoverageEntry())
}

function createEmptyCoverageEntry(): CoverageEntry {
  return {
    lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
    statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
    functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
    branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
  }
}

export function combineEntries(first: CoverageEntry, second: CoverageEntry): CoverageEntry {
  return {
    lines: combineItems(first.lines, second.lines),
    statements: combineItems(first.statements, second.statements),
    branches: combineItems(first.branches, second.branches),
    functions: combineItems(first.functions, second.functions),
  }
}

function sortFileByCoverageKey(
  files: string[],
  coverageCollection: CoverageCollection,
  ascending: boolean,
  key: string
) {
  return files
    .map(file => {
      return { file, entry: coverageCollection[file] }
    })
    .sort((a, b) => (ascending ? a.entry.lines[key] - b.entry.lines[key] : b.entry.lines[key] - a.entry.lines[key]))
    .map(entry => entry.file)
}

function sortFilesAlphabetically(files: string[]): string[] {
  return files.sort((a, b) => a.localeCompare(b, "en-US"))
}

/**
 * Sorts a list of files by their total line coverage.
 * @param files The files list
 * @param coverageCollection The collection of file coverages.
 * @param method The method to use while sorting
 * @returns The sorted list of file names.
 */
export function sortFiles(files: string[], coverageCollection: CoverageCollection, method: SortMethod) {
  switch (method) {
    case "alphabetically":
      return sortFilesAlphabetically(files)
    case "least-coverage":
      return sortFileByCoverageKey(files, coverageCollection, true, "pct")
    case "most-coverage":
      return sortFileByCoverageKey(files, coverageCollection, false, "pct")
    case "largest-file-size":
      return sortFileByCoverageKey(files, coverageCollection, false, "total")
    case "smallest-file-size":
      return sortFileByCoverageKey(files, coverageCollection, true, "total")
    case "uncovered-lines":
      return sortFileByCoverageKey(files, coverageCollection, false, "skipped")
  }
}

export function makeCoverageModel(
  numberOfEntries: number,
  files: string[],
  coverageCollection: CoverageCollection,
  sortMethod: SortMethod = "alphabetically"
) {
  const sortedFiles = sortFiles(files, coverageCollection, sortMethod)

  const displayedFiles = sortedFiles.slice(0, Math.min(sortedFiles.length, numberOfEntries))
  const displayedEntries = displayedFiles.map(file => coverageCollection[file])
  const ellidedEntries = sortedFiles.slice(numberOfEntries).map(file => coverageCollection[file])

  const ellidedSummary = reduceEntries(ellidedEntries)
  const totalSummary = reduceEntries([...displayedEntries, ellidedSummary])

  const coverageEntries = displayedFiles.reduce((current, file) => {
    const copy = { ...current }
    copy[file] = coverageCollection[file]
    return copy
  }, {})

  return {
    displayed: coverageEntries,
    total: totalSummary,
    elided: ellidedSummary,
    elidedCount: ellidedEntries.length,
  }
}

export function meetsThreshold(entry: CoverageEntry, threshold: CoverageThreshold) {
  return (
    entry.lines.pct >= threshold.lines &&
    entry.functions.pct >= threshold.functions &&
    entry.branches.pct >= threshold.branches &&
    entry.statements.pct >= threshold.statements
  )
}
