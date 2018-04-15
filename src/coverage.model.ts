import * as path from "path"
import { CoverageThreshold } from "./config.model"
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

export interface CoverageModel {
  total: CoverageEntry
  [key: string]: CoverageEntry
}

export function combineItems(first: CoverageItem, second: CoverageItem): CoverageItem {
  const percentage =
    second.covered + first.covered > 0 ? 100 * (first.covered + second.covered) / (second.total + first.total) : 100
  return {
    total: first.total + second.total,
    covered: first.covered + second.covered,
    skipped: first.skipped + second.skipped,
    pct: percentage,
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

export function createEmptyCoverageEntry(): CoverageEntry {
  return {
    lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
    statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
    functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
    branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
  }
}

export function parseCoverageModel(coveragePath: string): CoverageModel | undefined {
  const filesystem = new FilesystemService()

  if (!filesystem.exists(coveragePath)) {
    throw Error(`Couldn't find instanbul coverage json file at path '${coveragePath}'.`)
  }

  try {
    const json = JSON.parse(filesystem.read(coveragePath))
    if (Object.keys(json).length === 0) {
      // Don't output anything if there is no coverage data.
      return undefined
    }
    return json as CoverageModel
  } catch (error) {
    throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`)
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
