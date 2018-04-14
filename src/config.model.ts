export type ReportFileSet = "created" | "modified" | "createdOrModified" | "all"
export type ReportMode = "fail" | "warn" | "message"
export interface CoverageThreshold {
  statements: number,
  branches: number,
  functions: number,
  lines: number,
}

export interface Config {
  coveragePath: string,
  reportFileSet: ReportFileSet,
  threshold: CoverageThreshold,
  reportMode: ReportMode
}

export function makeCompleteConfiguration(config?: Partial<Config>): Config {
    const defaults: Config = {
      coveragePath: "./coverage/coverage-summary.json",
      reportFileSet: "all",
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