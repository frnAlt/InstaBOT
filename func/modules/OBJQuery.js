"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryObjects = queryObjects;
function queryObjects(objects, query, findOne = false, selectedFields = []) {
    function isPlainObject(obj) {
        return (obj !== null &&
            typeof obj === "object" &&
            !Array.isArray(obj) &&
            obj.constructor === Object);
    }
    function matchCondition(value, condition) {
        if (condition === undefined)
            return true;
        if (condition.$gt !== undefined)
            return value > condition.$gt;
        if (condition.$exists !== undefined)
            return condition.$exists === true
                ? value !== undefined && value !== null
                : value === undefined || value === null;
        if (condition.$lt !== undefined)
            return value < condition.$lt;
        if (condition.$gte !== undefined)
            return value >= condition.$gte;
        if (condition.$lte !== undefined)
            return value <= condition.$lte;
        if (condition.$ne !== undefined)
            return value !== condition.$ne;
        if (Array.isArray(condition.$in))
            return condition.$in.includes(value);
        if (condition.$regex instanceof RegExp)
            return condition.$regex.test(value);
        return value === condition;
    }
    function getValueByPath(obj, path) {
        return path
            .split(".")
            .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }
    function selectFields(obj, selectedFields) {
        if (selectedFields.length === 0)
            return obj;
        const selectedObj = {};
        selectedFields.forEach((field) => {
            const value = getValueByPath(obj, field);
            if (value !== undefined) {
                selectedObj[field] = value;
            }
        });
        return selectedObj;
    }
    function matchObject(obj, query) {
        for (let key in query) {
            if (query.hasOwnProperty(key)) {
                const condition = query[key];
                if (key.startsWith("value.")) {
                    const path = key.substring(6); // Remove 'value.' prefix
                    const value = getValueByPath(obj, path);
                    if (!matchCondition(value, condition))
                        return false;
                }
                else {
                    const value = obj[key];
                    if (!matchCondition(value, condition))
                        return false;
                }
            }
        }
        return true;
    }
    if (!isPlainObject(objects)) {
        throw new Error("Input must be a plain object.");
    }
    const results = Object.entries(objects).filter(([, obj]) => matchObject(obj, query));
    const selectedResults = results.map(([key, obj]) => [
        key,
        selectFields(obj, selectedFields),
    ]);
    if (findOne) {
        return (selectedResults.length > 0 ? selectedResults[0] : undefined);
    }
    return selectedResults;
}
