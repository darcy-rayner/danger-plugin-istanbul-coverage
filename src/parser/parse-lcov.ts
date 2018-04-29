import { CoverageCollection, CoverageEntry, CoverageItem } from "../coverage.model"
import FilesystemService from "../filesystem.service"

enum LcovToken {
  TEST_NAME = "TN",
  SOURCE_FILE = "SF",
  FUNCTION = "FN",
  FUNCTION_HITS = "FNDA",
  FUNCTIONS_FOUND = "FNF",
  FUNCTIONS_HIT = "FNH",
  BRANCH = "BRDA",
  BRANCHES_FOUND = "BRF",
  BRANCHES_HIT = "BRH",
  LINE = "DA",
  LINES_HIT = "LH",
  LINES_FOUND = "LF",
  END_OF_RECORD = "end_of_record",
}

const reverseTokenLookup = new Map<string, LcovToken>()
Object.keys(LcovToken).forEach((token: LcovToken) => {
  const tokenValue: string = LcovToken[token]
  reverseTokenLookup.set(tokenValue, token)
})
Object.freeze(reverseTokenLookup)

function getTokenFromValue(tokenValue: string): LcovToken {
  return LcovToken[reverseTokenLookup.get(tokenValue) as string]
}

interface Line {
  token: LcovToken
  parts: string[]
}

function partsExpected(token: LcovToken): number {
  switch (token) {
    case LcovToken.TEST_NAME:
      return 1
    case LcovToken.SOURCE_FILE:
      return 1
    case LcovToken.FUNCTION:
      return 2
    case LcovToken.FUNCTION_HITS:
      return 2
    case LcovToken.FUNCTIONS_FOUND:
      return 1
    case LcovToken.FUNCTIONS_HIT:
      return 1
    case LcovToken.BRANCH:
      return 4
    case LcovToken.BRANCHES_FOUND:
      return 1
    case LcovToken.BRANCHES_HIT:
      return 1
    case LcovToken.LINE:
      return 3
    case LcovToken.LINES_HIT:
      return 1
    case LcovToken.LINES_FOUND:
      return 1
    case LcovToken.END_OF_RECORD:
      return 0
  }
}

function splitWithTail(str: string, delim: string, count: number): string[] {
  const parts = str.split(delim)
  const tail = parts.slice(count).join(delim)
  const result = parts.slice(0, count)
  result.push(tail)
  return result
}

function splitLine(line: string): Line | undefined {
  const splitIndex = line.indexOf(":")
  if (line === LcovToken.END_OF_RECORD) {
    return { token: LcovToken.END_OF_RECORD, parts: [] }
  }
  const key = line.substring(0, splitIndex)
  const token: LcovToken | undefined = getTokenFromValue(key)
  if (token === undefined) {
    return undefined
  }
  const expectedParts = partsExpected(token)
  const remainder = line.slice(splitIndex + 1)
  if (remainder.length === 0) {
    return { token, parts: [] }
  }
  let parts = expectedParts > 1 ? remainder.split(",") : [remainder]
  parts = parts.map(part => part.trim())
  return { token, parts }
}

function makeCoverageItem(total: number, covered: number): CoverageItem {
  return { total, covered, skipped: total - covered, pct: covered / total * 100 }
}

function convertToCollection(lines: Line[]): CoverageCollection {
  let file: string | undefined
  let numFunctions: number | undefined
  let numFunctionsHit: number | undefined
  let numBranches: number | undefined
  let numBranchesHit: number | undefined
  let numLines: number | undefined
  let numLinesHit: number | undefined

  const collection: CoverageCollection = {}

  lines.forEach(line => {
    switch (line.token) {
      case LcovToken.SOURCE_FILE:
        file = line.parts[0]
        break
      case LcovToken.FUNCTIONS_FOUND:
        numFunctions = Number(line.parts[0])
        break
      case LcovToken.FUNCTIONS_HIT:
        numFunctionsHit = Number(line.parts[0])
        break
      case LcovToken.BRANCHES_HIT:
        numBranchesHit = Number(line.parts[0])
        break
      case LcovToken.BRANCHES_FOUND:
        numBranches = Number(line.parts[0])
        break
      case LcovToken.LINES_HIT:
        numLinesHit = Number(line.parts[0])
        break
      case LcovToken.LINES_FOUND:
        numLines = Number(line.parts[0])
        break
      case LcovToken.END_OF_RECORD:
        if (
          file === undefined ||
          numFunctions === undefined ||
          numFunctionsHit === undefined ||
          numBranches === undefined ||
          numBranchesHit === undefined ||
          numLines === undefined ||
          numLinesHit === undefined
        ) {
          throw Error()
        }

        collection[file] = {
          lines: makeCoverageItem(numLines, numLinesHit),
          functions: makeCoverageItem(numFunctions, numFunctionsHit),
          branches: makeCoverageItem(numBranches, numBranchesHit),
          statements: makeCoverageItem(numLines, numLinesHit),
        }
        file = undefined
        numFunctions = undefined
        numFunctionsHit = undefined
        numBranches = undefined
        numBranchesHit = undefined
        numLines = undefined
        numLinesHit = undefined
        break
    }
  })
  return collection
}

export function parseLcov(coveragePath: string): CoverageCollection {
  const filesystem = new FilesystemService()

  if (!filesystem.exists(coveragePath)) {
    throw Error(`Couldn't find instanbul coverage json file at path '${coveragePath}'.`)
  }

  let content: string
  try {
    content = filesystem.read(coveragePath)
    const lines: Line[] = content
      .split("\n")
      .map(splitLine)
      .filter(line => line !== undefined) as Line[]
    return convertToCollection(lines)
  } catch (error) {
    throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`)
  }
}
