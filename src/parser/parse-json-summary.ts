"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filesystem_service_1 = require("../filesystem.service");
const lodash_1 = require("lodash");
function isObject(obj) {
    return obj instanceof Object && obj.constructor === Object;
}
function isCoverageItem(coverageItem) {
    if (!isObject(coverageItem)) {
        return false;
    }
    const keys = Object.keys(coverageItem).sort();
    if (!lodash_1.isEqual(keys, ["covered", "pct", "skipped", "total"])) {
        return false;
    }
    for (const key of keys) {
        const numb = coverageItem[key];
        if (typeof numb !== "number") {
            return false;
        }
    }
    return true;
}
function isCoverageEntry(coverageEntry, entryName) {
    if (!isObject(coverageEntry)) {
        return false;
    }
	else if (entryName === 'total') {
		const keys = Object.keys(coverageEntry).sort();
		if (!lodash_1.isEqual(keys, ["branches", "branchesTrue", "functions", "lines", "statements"])) {
			return false;
		}
		for (const key of keys) {
			const entry = coverageEntry[key];
			if (!isCoverageItem(entry)) {
				return false;
			}
		}
		return true;
	}
	else {
		const keys = Object.keys(coverageEntry).sort();
		if (!lodash_1.isEqual(keys, ["branches", "functions", "lines", "statements"])) {
			return false;
		}
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
export function parseJsonSummary(coveragePath) {
    const filesystem = new filesystem_service_1.default();
    if (!filesystem.exists(coveragePath)) {
        throw Error(`Couldn't find instanbul coverage json file at path '${coveragePath}'.`);
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
		console.log('second error');
        throw Error(`Coverage data had invalid formatting at path '${coveragePath}'`);
    }
}
exports.parseJsonSummary = parseJsonSummary;
