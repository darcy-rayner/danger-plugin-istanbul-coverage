// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
import * as fs from "fs"
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export enum ReportChangeType {
  CREATED_FILES,
  MODIFIED_FILES,
  CREATED_OR_MODIFIED_FILES,
  ALL_FILES,
}
export enum ReportMode {
  FAIL,
  WARN,
  MESSAGE,
}

export interface KarmaInstanbulConfig {
  coveragePath: string,
  reportChangeType: ReportChangeType,
  threshold: {
    statements: number,
    lines: number,
    branches: number,
    functions: number,
  },
  reportMode: ReportMode
}

/**
 * Danger.js plugin for monitoring code coverage on changed files.
 */
export function karmaInstanbul(config?: Partial<KarmaInstanbulConfig>) {
  const defaults: KarmaInstanbulConfig = {
    coveragePath: "coverage",
    reportChangeType: ReportChangeType.CREATED_OR_MODIFIED_FILES,
    reportMode: ReportMode.MESSAGE,
    threshold: {
      statements: 100,
      lines: 100,
      branches: 100,
      functions: 100,
    },
  }
  const combinedConfig = config ? { ... defaults, ... config } : defaults
  throw Error("Unimplemented")
}
