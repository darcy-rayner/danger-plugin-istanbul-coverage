# danger-plugin-istanbul-coverage

[![Build Status](https://travis-ci.org/darcy-rayner/danger-plugin-istanbul-coverage.svg?branch=master)](https://travis-ci.org/darcy-rayner/danger-plugin-istanbul-coverage)
[![npm version](https://badge.fury.io/js/danger-plugin-istanbul-coverage.svg)](https://badge.fury.io/js/danger-plugin-istanbul-coverage)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Danger.js plugin for monitoring code coverage on changed files.

<p align="center">
  <img src="example.png" ></img>
</p>

## Usage

Install:

```sh
yarn add danger-plugin-istanbul-coverage --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from "danger"
import istanbulCoverage from "danger-plugin-istanbul-coverage"

schedule(istanbulCoverage()) // Use default configuration

schedule(istanbulCoverage({
  // Set a custom success message
  customSuccessMessage: "Congrats, coverage is good",

  // Set a custom failure message
  customFailureMessage: "Coverage is a little low, take a look",

  // How to sort the entries in the table
  entrySortMethod: SortMethod.Alphabetical // || LeastCoverage|| MostCoverage || LargestFileSize ||SmallestFileSize || UncoveredLines

  // Add a maximum number of entries to display
  numberOfEntries: 10,

  // The location of the istanbul coverage file.
  coveragePath: "./coverage/coverage-summary.json",

  // Which set of files to summarise from the coverage file.
  reportFileSet: "all", // || "modified" || "created" || "createdOrModified"

  // What to do when the PR doesn't meet the minimum code coverage threshold
  reportMode: ReportMode.Message, // || Warn || Fail

  // Minimum coverage threshold percentages. Compared against the cumulative coverage of the reportFileSet. 
  threshold: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  }
}))
```

This plugin requires the 'json-summary' report mode be enabled with Istanbul. Make sure Danger runs after your unit tests in your CI workflow. 

## Changelog

See the GitHub [release history](https://github.com/darcy-rayner/danger-plugin-istanbul-coverage/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
