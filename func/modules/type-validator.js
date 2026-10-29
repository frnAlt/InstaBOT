"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassTypes = void 0;
exports.example = example;
var CassTypes;
(function (CassTypes) {
    class Union {
        types;
        constructor(...types) {
            this.types = types;
        }
    }
    CassTypes.Union = Union;
    class Intersection {
        types;
        constructor(...types) {
            this.types = types;
        }
    }
    CassTypes.Intersection = Intersection;
    /**
     * OOP wrapper class for type schemas
     */
    class Validator {
        schema;
        /**
         * Creates a new schema instance
         * @param schema The type schema to wrap
         */
        constructor(schema) {
            this.schema = schema;
        }
        /**
         * Gets the underlying schema
         * @returns The wrapped TypeSchema
         */
        getSchema() {
            return this.schema;
        }
        /**
         * Validates a value against the schema
         * @param value The value to validate
         * @param path The path for error reporting
         * @throws Error if validation fails
         */
        validate(value, path = "") {
            checkType(value, this.schema, path);
        }
        /**
         * Checks if a value matches the schema
         * @param value The value to check
         * @returns Whether the value matches the schema
         */
        isValid(value) {
            return isType(value, this.schema);
        }
        /**
         * Generates a dynamic schema from an object using this schema as a base
         * @param obj The object to generate schema from
         * @returns A new OOPSchema instance
         */
        generateDynamic(obj) {
            return new Validator(generateDynamicSchema(obj));
        }
    }
    CassTypes.Validator = Validator;
    /**
     * Generates a type schema from an object dynamically
     * @param obj The object to generate schema from
     * @returns A TypeSchema representing the object's structure
     */
    function generateDynamicSchema(obj) {
        if (obj === null)
            return "object";
        if (Array.isArray(obj))
            return obj.length > 0 ? [inferArrayItemSchema(obj)] : ["any"];
        if (typeof obj !== "object")
            return typeof obj;
        const schema = {};
        for (const key in obj) {
            const value = obj[key];
            if (value === null) {
                schema[key] = "object";
            }
            else if (value === undefined) {
                schema[key] = "undefined";
            }
            else if (Array.isArray(value)) {
                schema[key] =
                    value.length > 0 ? [inferArrayItemSchema(value)] : ["any"];
            }
            else if (typeof value === "object") {
                schema[key] = generateDynamicSchema(value);
            }
            else {
                schema[key] = typeof value;
            }
        }
        return schema;
    }
    /**
     * Infers the schema for array items
     * @param arr The array to infer schema from
     * @returns A TypeSchema for the array items
     */
    function inferArrayItemSchema(arr) {
        if (arr.length === 0)
            return "any";
        const firstItem = arr[0];
        if (firstItem === null)
            return "object";
        if (typeof firstItem === "object" && !Array.isArray(firstItem)) {
            return generateDynamicSchema(firstItem);
        }
        if (Array.isArray(firstItem)) {
            return [inferArrayItemSchema(firstItem)];
        }
        return typeof firstItem;
    }
    /**
     * Checks if a value is a primitive of the specified type
     * @param value The value to check
     * @param type The expected primitive type
     * @returns Whether the value matches the primitive type
     */
    function isPrimitive(value, type) {
        if (type === "object") {
            return (value !== null && !Array.isArray(value) && typeof value === "object");
        }
        if (type === "array") {
            return Array.isArray(value);
        }
        return typeof value === type;
    }
    CassTypes.isPrimitive = isPrimitive;
    /**
     * Checks if a value is an array with items matching the schema
     * @param value The value to check
     * @param itemSchema The schema for array items
     * @returns Whether the value is an array matching the item schema
     */
    function isArrayOf(value, itemSchema) {
        if (!Array.isArray(value))
            return false;
        return value.every((item) => isType(item, itemSchema));
    }
    CassTypes.isArrayOf = isArrayOf;
    /**
     * Checks if a value is an object matching the schema
     * @param value The value to check
     * @param schema The object schema to validate against
     * @returns Whether the value is an object matching the schema
     */
    function isObjectOf(value, schema) {
        if (typeof value !== "object" || value === null || Array.isArray(value))
            return false;
        return Object.keys(schema).every((key) => key in value && isType(value[key], schema[key]));
    }
    CassTypes.isObjectOf = isObjectOf;
    /**
     * Checks if a value matches a given type schema
     * @param value The value to check
     * @param schema The type schema to validate against
     * @returns Whether the value matches the schema
     */
    function isType(value, schema) {
        if (schema instanceof Union) {
            return schema.types.some((type) => isType(value, type));
        }
        if (schema instanceof Intersection) {
            return schema.types.every((type) => isType(value, type));
        }
        if (typeof schema === "function" && schema.prototype) {
            return value instanceof schema;
        }
        if (typeof schema === "string") {
            return isPrimitive(value, schema);
        }
        if (Array.isArray(schema)) {
            return isArrayOf(value, schema[0]);
        }
        if (typeof schema === "object" && schema !== null) {
            return isObjectOf(value, schema);
        }
        return false;
    }
    CassTypes.isType = isType;
    /**
     * Validates a value against a type schema, throwing errors on mismatch
     * @param value The value to validate
     * @param schema The type schema to validate against
     * @param path The current path in the object structure (for error messages)
     * @throws Error if the value doesn't match the schema
     */
    function checkType(value, schema, path = "") {
        if (schema instanceof Union) {
            const errors = [];
            let matched = false;
            for (const type of schema.types) {
                try {
                    checkType(value, type, path);
                    matched = true;
                    break;
                }
                catch (e) {
                    errors.push(e.message);
                }
            }
            if (!matched) {
                throw new TypeError(`Type mismatch at '${path}': expected one of union types, got '${typeof value}'. Errors: ${errors.join("; ")}`);
            }
            return;
        }
        if (schema instanceof Intersection) {
            for (const type of schema.types) {
                checkType(value, type, path);
            }
            return;
        }
        if (typeof schema === "function" && schema.prototype) {
            if (!(value instanceof schema)) {
                throw new TypeError(`Type mismatch at '${path}': expected instance of '${schema.name}', got '${value?.constructor?.name || typeof value}'`);
            }
            return;
        }
        if (typeof schema === "string") {
            if (!isPrimitive(value, schema)) {
                throw new TypeError(`Type mismatch at '${path}': expected '${schema}', got '${typeof value}'`);
            }
            return;
        }
        if (Array.isArray(schema)) {
            if (!Array.isArray(value)) {
                throw new TypeError(`Type mismatch at '${path}': expected array, got '${typeof value}'`);
            }
            value.forEach((item, index) => {
                checkType(item, schema[0], `${path}[${index}]`);
            });
            return;
        }
        if (typeof schema === "object" && schema !== null) {
            if (typeof value !== "object" || value === null || Array.isArray(value)) {
                throw new TypeError(`Type mismatch at '${path}': expected object, got '${typeof value}'`);
            }
            for (const key in schema) {
                if (!(key in value)) {
                    throw new TypeError(`Missing property '${key}' at '${path}'`);
                }
                checkType(value[key], schema[key], path ? `${path}.${key}` : key);
            }
        }
    }
    CassTypes.checkType = checkType;
    /**
     * Creates a wrapper function that validates parameters and return value
     * @template P Array of parameter schemas
     * @template R Return value schema
     * @param originalFn The function to wrap
     * @param paramsArray Array of parameter schemas
     * @param returnValue Return value schema
     * @param methodName Name of the method (for error messages)
     * @returns Wrapped function with type validation
     */
    function wrapMethod(originalFn, paramsArray, returnValue, methodName = "anonymous") {
        return function (...args) {
            if (args.length !== paramsArray.length) {
                throw new TypeError(`Parameter count mismatch at '${methodName}': expected ${paramsArray.length}, got ${args.length}`);
            }
            paramsArray.forEach((schema, index) => {
                const effectiveSchema = typeof schema === "object" &&
                    schema !== null &&
                    !Array.isArray(schema) &&
                    // @ts-ignore
                    !schema.prototype
                    ? generateDynamicSchema(schema)
                    : schema;
                checkType(args[index], effectiveSchema, `${methodName} param[${index}]`);
            });
            // @ts-ignore
            const result = originalFn.apply(this, args);
            const effectiveReturnSchema = typeof returnValue === "object" &&
                returnValue !== null &&
                !Array.isArray(returnValue) &&
                // @ts-ignore
                !returnValue.prototype
                ? generateDynamicSchema(returnValue)
                : returnValue;
            checkType(result, effectiveReturnSchema, `${methodName} return value`);
            return result;
        };
    }
    CassTypes.wrapMethod = wrapMethod;
})(CassTypes || (exports.CassTypes = CassTypes = {}));
function example() {
    const validator = new CassTypes.Validator({
        name: String,
        age: Number,
        a: new CassTypes.Union(String, Map),
    });
    const validator2 = new CassTypes.Validator(new CassTypes.Union("string", Map));
    console.log(validator2);
    let user = {
        name: "Liane",
        age: 19,
        a: new Map(),
    };
    console.log(user);
    validator.validate({ name: "Hello", age: 5, a: new Map() });
}
