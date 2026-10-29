"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = Enum;
/**
 * Implementation of Enum function.
 * @internal
 */
function Enum(values) {
    const enumObject = Object.create(null);
    if (Array.isArray(values)) {
        const seenValues = new Set();
        values.forEach((value, index) => {
            enumObject[index] = value;
            // Add reverse mapping for unique string or number values
            if ((typeof value === "string" || typeof value === "number") &&
                !seenValues.has(value)) {
                enumObject[value] = index;
                seenValues.add(value);
            }
        });
    }
    else {
        for (const key in values) {
            enumObject[key] = values[key];
        }
    }
    return Object.freeze(enumObject);
}
