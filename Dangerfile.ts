import { danger } from "danger"

import { istanbulCoverage } from "./src/index"

istanbulCoverage({
  reportFileSet: "modified",
  threshold: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
})
