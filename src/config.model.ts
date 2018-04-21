export type ReportFileSet = "created" | "modified" | "createdOrModified" | "all"
export type ReportMode = "fail" | "warn" | "message"

export enum SortMethod {
  Alphabetically = "alphabetically",
  LeastCoverage = "least-coverage",
  MostCoverage = "most-coverage",
  LargestFileSize = "largest-file-size",
  SmallestFileSize = "smallest-file-size",
  UncoveredLines = "uncovered-lines",
}

export interface CoverageThreshold {
  statements: number
  branches: number
  functions: number
  lines: number
}

export interface Config {
  customSuccessMessage?: string
  customFailureMessage?: string
  numberOfEntries: number
  entrySortMethod: SortMethod
  coveragePath: string
  reportFileSet: ReportFileSet
  threshold: CoverageThreshold
  reportMode: ReportMode
}

/**
 * Completes a partial configuration with default values.
 * @param config The configuration to complete
 * @returns A complete configuration
 */
export function makeCompleteConfiguration(config?: Partial<Config>): Config {
  const defaults: Config = {
    coveragePath: "./coverage/coverage-summary.json",
    reportFileSet: "all",
    reportMode: "message",
    entrySortMethod: SortMethod.Alphabetically,
    numberOfEntries: 10,
    threshold: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  }
  return config ? { ...defaults, ...config } : defaults
}
