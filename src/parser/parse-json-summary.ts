import { parse } from "path";
import { CoverageCollection, CoverageEntry, CoverageItem } from "../coverage.model"
import FilesystemService from "../filesystem.service"

import { isEqual } from "lodash"

function isObject(obj: any): boolean {
  return obj instanceof Object && obj.constructor === Object
}

function isCoverageItem(coverageItem) {
    if (!isObject(coverageItem)) {
        return false;
    }
    const keys = Object.keys(coverageItem).sort();
    if (!isEqual(keys, ["covered", "pct", "skipped", "total"])) {
        return false;
    }
    for (const key of keys) {
        const numb = coverageItem[key];
        if (typeof numb !== "number") {
			if (numb == 'Unknown') {
				continue;
			}
            return false;
        }
    }
    return true;
}
function isCoverageEntry(coverageEntry, entryName) {
	const keys = Object.keys(coverageEntry).sort();
    if (!isObject(coverageEntry)) {
        return false;
    }
    else if ((entryName === 'total' && !isEqual(keys, ["branches", "branchesTrue", "functions", "lines", "statements"])) || (entryName !== 'total' && !isEqual(keys, ["branches", "functions", "lines", "statements"]))) {
		return false;
	}
	else {
		for (const key of keys) {
			const entry = coverageEntry[key];
            if (!isCoverageItem(entry)) {
                return false;
            }
        }
        return true;
	}
}
function isCoverageCollection(collection) {
    if (!isObject(collection)) {
        return false;
    }
    for (const key of Object.keys(collection)) {
        const entry = collection[key];
        if (!isCoverageEntry(entry, key)) {
            return false;
        }
    }
    return true;
}
/**
 * Parses a json-summary formatted output from istanbul
 * @param coveragePath The path of the coverage file
 * @returns A coverage collection
 * @throws Throws an error if formatting is invalid.
 */
function parseJsonSummary(coveragePath) {
    const filesystem = new FilesystemService;
    if (!filesystem.exists(coveragePath)) {
		console.log(`No coverage found at '${coveragePath}', continuing...\n`);
		return {};
    }
    let json = {};
    try {
        json = JSON.parse(filesystem.read(coveragePath));
        if (Object.keys(json).length === 0) {
            // Don't output anything if there is no coverage data.
            return {};
        }
    }
    catch (error) {
        throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`);
    }
    if (isCoverageCollection(json)) {
        return json;
    }
    else {
        // the json is being parsed properly, but it's failing their custom isCoverageCollection method because of the new 'branchesTrue' key which is present in new json outputs
        throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`);
    }
}

export default parseJsonSummary;