import { CoverageCollection, CoverageEntry, CoverageItem } from "../coverage.model"
import FilesystemService from "../filesystem.service"

import { isEqual } from "lodash"

function isObject(obj: any): boolean {
  return obj instanceof Object && obj.constructor === Object
}

function isCoverageItem(coverageItem: any): coverageItem is CoverageItem {
  if (!isObject(coverageItem)) {
    return false
  }
  const keys = Object.keys(coverageItem).sort()
  if (!isEqual(keys, ["covered", "pct", "skipped", "total"])) {
    return false
  }

  for (const key of keys) {
    const numb = coverageItem[key]
    if (typeof numb !== "number") {
      return false
    }
  }

  return true
}

function isCoverageEntry(coverageEntry: any): coverageEntry is CoverageEntry {
  if (!isObject(coverageEntry)) {
    return false
  }
  const keys = Object.keys(coverageEntry).sort()
  if (!isEqual(keys, ["branches", "functions", "lines", "statements"])) {
    return false
  }
  for (const key of keys) {
    const entry = coverageEntry[key]
    if (!isCoverageItem(entry)) {
      return false
    }
  }
  return true
}

function isCoverageCollection(collection: any): collection is CoverageCollection {
  if (!isObject(collection)) {
    return false
  }
  for (const key of Object.keys(collection)) {
    const entry = collection[key]
    if (!isCoverageEntry(entry)) {
      return false
    }
  }
  return true
}

export function parseJsonSummary(coveragePath: string): CoverageCollection | undefined {
  const filesystem = new FilesystemService()

  if (!filesystem.exists(coveragePath)) {
    throw Error(`Couldn't find instanbul coverage json file at path '${coveragePath}'.`)
  }

  let json = {}
  try {
    json = JSON.parse(filesystem.read(coveragePath))
    if (Object.keys(json).length === 0) {
      // Don't output anything if there is no coverage data.
      return undefined
    }
  } catch (error) {
    throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`)
  }

  if (isCoverageCollection(json)) {
    return json
  } else {
    throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`)
  }
}
