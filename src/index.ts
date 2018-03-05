// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export enum KarmaInstanbulReportMode {
  NEW_FILES,
  MODIFIED_FILES,
  NEW_OR_MODIFIED_FILES,
}

export interface KarmaInstanbulConfig {
  coveragePath: string,
  reportMode: KarmaInstanbulReportMode,
  threshold: {
    statements: number,
    lines: number,
    branches: number,
    functions: number,
  },
  failBuild: boolean
}

/**
 * Danger.js plugin for monitoring code coverage on changed files.
 */
export default function karmaInstanbul(config?: Partial<KarmaInstanbulConfig>) {
  const defaults: KarmaInstanbulConfig = {
    coveragePath: "coverage",
    reportMode: KarmaInstanbulReportMode.NEW_OR_MODIFIED_FILES,
    threshold: {
      statements: 100,
      lines: 100,
      branches: 100,
      functions: 100,
    },
    failBuild: false,
  }
  const combinedConfig = config ? { ... defaults, ... config } : defaults
}
