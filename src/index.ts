// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
import * as path from "path"
import FilesystemService from "./filesystem.service"
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export type ReportChangeType = "created" | "modified" | "createdOrModified" | "all";
export type ReportMode = "fail" | "warn" | "message"

export interface KarmaInstanbulConfig {
  coveragePath: string,
  reportChangeType: ReportChangeType,
  threshold: {
    statements: number,
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
    coveragePath: "./coverage/coverage-final.json",
    reportChangeType: "all",
    reportMode: "message",
    threshold: {
      statements: 100,
      branches: 100,
      functions: 100,
    },
  }
  const combinedConfig = config ? { ... defaults, ... config } : defaults

  const resolvedPath = path.resolve(__dirname, combinedConfig.coveragePath)
  const filesystem = new FilesystemService()

  if (!filesystem.exists(resolvedPath)) {
    warn(`Couldn't find instanbul coverage json file at path '${resolvedPath}'.`)
    return
  }

  throw Error("Unimplemented")
}
