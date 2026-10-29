"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunctionObject = createFunctionObject;
exports.createFunctionMetadata = createFunctionMetadata;
exports.composeFunctions = composeFunctions;
exports.trackFunction = trackFunction;
exports.changePrototype = changePrototype;
function createFunctionObject(func, properties, constructHandler) {
    if (typeof func !== "function") {
        throw new TypeError("First argument must be a function");
    }
    const functionObject = Object.assign(function (...args) {
        if (constructHandler && new.target) {
            Object.assign(this, properties);
            constructHandler.call(this, this);
            const result = func.apply(this, args);
            return result && typeof result === "object" ? result : this;
        }
        return func.apply(this || functionObject, args);
    }, properties);
    const boundFunction = functionObject.bind(functionObject);
    return new Proxy(boundFunction, {
        get: (target, prop, receiver) => Reflect.get(target, prop, receiver),
        set: (target, prop, value, receiver) => {
            if (!(prop in Function.prototype)) {
                return Reflect.set(target, prop, value, receiver);
            }
            return false;
        },
        has: (target, prop) => Reflect.has(target, prop),
        ownKeys: (target) => Reflect.ownKeys(target).filter((key) => !(key in Function.prototype)),
        ...(constructHandler
            ? {
                construct(target, args) {
                    return Reflect.construct(functionObject, args, target);
                },
            }
            : {}),
    });
}
function createFunctionMetadata(func, metadata) {
    const metaStore = new Map(Object.entries(metadata));
    const enhancedFunction = Object.defineProperties(func, {
        getMeta: {
            value: (key) => key ? metaStore.get(key) : Object.fromEntries(metaStore),
            enumerable: false,
        },
        setMeta: {
            value: (key, value) => {
                metaStore.set(key, value);
                return enhancedFunction;
            },
            enumerable: false,
        },
        withMeta: {
            value: (newMetadata) => {
                Object.entries(newMetadata).forEach(([k, v]) => metaStore.set(k, v));
                return enhancedFunction;
            },
            enumerable: false,
        },
    });
    return enhancedFunction;
}
function composeFunctions(...fns) {
    const composed = (...args) => {
        return fns.reduceRight((result, fn) => [
            // @ts-ignore
            fn.apply(null, Array.isArray(result) ? result : [result]),
        ], args)[0];
    };
    Object.defineProperty(composed, "functions", {
        value: fns,
        writable: false,
    });
    return Object.assign(composed, {
        andThen: (fn) => composeFunctions(...fns, fn),
        pipe: (fn) => composeFunctions(fn, ...fns),
        inspect: () => fns.map((fn) => fn.toString()),
    });
}
function trackFunction(func, options = {}) {
    const history = [];
    let callCount = 0;
    const tracked = function (...args) {
        const result = func.apply(this, args);
        callCount++;
        const entry = { args, result, timestamp: Date.now() };
        history.push(entry);
        if (options.maxHistory && history.length > options.maxHistory) {
            history.shift();
        }
        options.onCall?.({ calls: callCount, lastArgs: args, lastResult: result });
        return result;
    };
    return Object.defineProperties(tracked, {
        stats: {
            get: () => ({
                callCount,
                history: [...history],
                averageExecutionTime: history.length > 1
                    ? (history[history.length - 1].timestamp - history[0].timestamp) /
                        (history.length - 1)
                    : 0,
            }),
            enumerable: false,
        },
        clearStats: {
            value: () => {
                history.length = 0;
                callCount = 0;
            },
            enumerable: false,
        },
    });
}
function changePrototype(targetClass, target) {
    const newTarget = { ...target };
    Object.setPrototypeOf(newTarget, targetClass.prototype);
    return Object.create(newTarget, Object.getOwnPropertyDescriptors(target));
}
