// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
import * as _ from "lodash"
import * as path from "path"
import FilesystemService from "./filesystem.service"

export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export type ReportChangeType = "created" | "modified" | "createdOrModified" | "all"
export type ReportMode = "fail" | "warn" | "message"
export interface CoverageThreshold {
  statements: number,
  branches: number,
  functions: number,
  lines: number,
}

export interface KarmaInstanbulConfig {
  coveragePath: string,
  reportChangeType: ReportChangeType,
  threshold: CoverageThreshold,
  reportMode: ReportMode
}

interface CoverageItem {
  total: number,
  covered: number,
  skipped: number,
  pct: number
}

interface CoverageEntry {
  lines: CoverageItem,
  functions: CoverageItem,
  statements: CoverageItem,
  branches: CoverageItem,
}

interface CoverageModel {
  "total": CoverageEntry,
  [key: string]: CoverageEntry,
}

function parseCoverageModel(coveragePath: string): CoverageModel | undefined {
  const resolvedPath = path.resolve(__dirname, coveragePath)
  const filesystem = new FilesystemService()
  const emptyMessage = `Coverage data had invalid formatting at path '${resolvedPath}'`

  if (!filesystem.exists(resolvedPath)) {
    warn(`Couldn't find instanbul coverage json file at path '${resolvedPath}'.`)
    return undefined
  }

  try {
    const json = JSON.parse(filesystem.read(resolvedPath))
    if (Object.keys(json).length === 0) {
      // Don't output anything if there is no coverage data.
      return undefined
    }
    return json as CoverageModel
  } catch (error) {
    warn(emptyMessage)
    return
  }
}

function makeCompleteConfiguration(config?: Partial<KarmaInstanbulConfig>): KarmaInstanbulConfig {
  const defaults: KarmaInstanbulConfig = {
    coveragePath: "./coverage/coverage-final.json",
    reportChangeType: "all",
    reportMode: "message",
    threshold: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  }
  return config ? { ... defaults, ... config } : defaults
}

function filterForCoveredFiles(files: string[], coverage: CoverageModel): string[] {
  return files
    .map( (filename) => path.resolve(__dirname, filename) )
    .filter( filename => coverage[filename] !== undefined)
}

function getFileSet(
  reportChangeType: ReportChangeType,
  all: string[],
  modified: string[],
  created: string[]): string[] {
    if (reportChangeType === "all") {
      return all
    }
    if (reportChangeType === "modified") {
      return modified
    }
    if (reportChangeType === "created") {
      return created
    }
    return _.union(created, modified)
}

function meetsThreshold(entry: CoverageEntry, threshold: CoverageThreshold) {
  return entry.lines.pct >= threshold.lines
    && entry.functions.pct >= threshold.functions
    && entry.branches.pct >= threshold.branches
    && entry.statements.pct >= threshold.statements
}

function combineItems(first: CoverageItem, second: CoverageItem): CoverageItem {
  const percentage = (second.total + first.total) > 0 ?
    (first.pct * second.total + second.pct * first.total) / (second.total + first.total) : 0
  return {
    total: first.total + second.total,
    covered: first.covered + second.covered,
    skipped: first.skipped + second.skipped,
    pct: percentage,
  }
}

function combineEntries(first: CoverageEntry, second: CoverageEntry): CoverageEntry {
  return {
    lines: combineItems(first.lines, second.lines),
    statements: combineItems(first.statements, second.statements),
    branches: combineItems(first.branches, second.branches),
    functions: combineItems(first.functions, second.functions),
  }
}

function getReportFunc(reportMode: ReportMode) {
  if (reportMode === "warn") { return warn }
  if (reportMode === "fail") { return fail }
  return message
}

function getFileGroupLongDescription(reportChangeType: ReportChangeType) {
  if (reportChangeType === "all") { return "the whole codebase" }
  if (reportChangeType === "created") { return "these new files" }
  if (reportChangeType === "modified") { return "these modified files" }
  return "these modified or changed files"
}

function getFileGroupShortDescription(reportChangeType: ReportChangeType) {
  if (reportChangeType === "all") { return "All Files" }
  if (reportChangeType === "created") { return "New Files" }
  if (reportChangeType === "modified") { return "Modified Files" }
  return "Created or Modified Files"
}

function formatItem(item: CoverageItem) {
  return `(${item.covered}/${item.total}) ${item.pct.toFixed(0)}%`
}

function generateReport(coverage: CoverageModel, reportChangeType: ReportChangeType) {

  const header = `## Coverage in ${getFileGroupShortDescription(reportChangeType)}
File | Line Coverage | Statement Coverage | Function Coverage | Branch Coverage
---- | ------------- | ------------------ | ----------------- | ---------------
`
  const lines = Object
    .keys(coverage)
    .filter(filename => filename !== "total")
    .sort( (a, b) => a.localeCompare(b, "en-US") )
    .map( filename => {
      const e = coverage[filename]
      const shortFilename = path.relative(__dirname, filename)
      return [
        `[${shortFilename}](${shortFilename})`,
        formatItem(e.lines),
        formatItem(e.statements),
        formatItem(e.functions),
        formatItem(e.branches),
      ].join(" | ")
    })
    .join("\n")
  return `${header}${lines}\n`
}

/**
 * Danger.js plugin for monitoring code coverage on changed files.
 */
export function karmaInstanbul(config?: Partial<KarmaInstanbulConfig>) {

  const combinedConfig = makeCompleteConfiguration(config)
  const reportFunc = getReportFunc(combinedConfig.reportMode)

  const coverage = parseCoverageModel(combinedConfig.coveragePath)
  if (!coverage) { return }

  const modifiedFiles = filterForCoveredFiles(danger.git.modified_files, coverage)
  const createdFiles = filterForCoveredFiles(danger.git.created_files, coverage)
  const allFiles =  Object.keys(coverage)
    .filter( filename => filename !== "total")

  const files = getFileSet(combinedConfig.reportChangeType, allFiles, modifiedFiles, createdFiles)

  if (files.length === 0) { return }

  const coverageEntries: { [key: string]: CoverageEntry} = files
    .reduce((current, file) => {
      const copy = {... current }
      copy[file] = coverage[file]
      return copy
    }, {})

  const emptyCoverageEntry: CoverageEntry = {
    lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
    statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
    functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
    branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
  }
  const results = Object
    .keys(coverageEntries)
    .reduce((entry, filename) => combineEntries(entry, coverageEntries[filename]), emptyCoverageEntry)

  const messageType = getFileGroupLongDescription(combinedConfig.reportChangeType)
  if (!meetsThreshold(results, combinedConfig.threshold)) {
    reportFunc(`🤔 Hmmm, code coverage is looking low for ${messageType}.`)
  } else {
    message(`🎉 Test coverage is looking good for ${messageType}`)
  }

  const report = generateReport({... coverageEntries, total: results}, combinedConfig.reportChangeType)
  markdown(report)
}
