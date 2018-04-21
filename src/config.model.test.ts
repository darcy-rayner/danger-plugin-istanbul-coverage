import { makeCompleteConfiguration, ReportMode, SortMethod } from "./config.model"

describe("makeCompleteConfiguration", () => {
  const base = {
    coveragePath: "./coverage/coverage-summary.json",
    reportFileSet: "all",
    reportMode: ReportMode.Message,
    entrySortMethod: SortMethod.Alphabetically,
    numberOfEntries: 10,
    threshold: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  }

  it("returns a default configuration when sent undefined", () => {
    const output = makeCompleteConfiguration()
    expect(output).toEqual(base)
  })

  it("overrides a specific value from the default", () => {
    const output = makeCompleteConfiguration({
      reportMode: ReportMode.Warn,
    })
    expect(output).toEqual({
      ...base,
      reportMode: ReportMode.Warn,
    })
  })
})
