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

export function makeCompleteConfiguration(config?: Partial<KarmaInstanbulConfig>): KarmaInstanbulConfig {
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
