import { danger, schedule } from "danger"
import { istanbulCoverage, ReportFileSet } from "./src/index"

schedule(
  istanbulCoverage({
    reportFileSet: ReportFileSet.Modified,
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  })
)
