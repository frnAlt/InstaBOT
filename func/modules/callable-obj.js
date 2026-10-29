"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Namespace = void 0;
exports.createCallable = createCallable;
exports.createNamespace = createNamespace;
exports.cloneAllKeys = cloneAllKeys;
function createCallable(main, methods) {
    return createNamespace(() => methods, main);
}
function createNamespace(callback, target) {
    const safeTarget = target ?? {};
    const result = callback(safeTarget);
    const ownKeys = Object.getOwnPropertyNames(result);
    const from = Object.fromEntries(ownKeys.map((i) => [i, result[i]]));
    return Object.assign(safeTarget, from ?? {});
}
exports.Namespace = class Namespace {
    constructor(callback, target) {
        return createNamespace(callback, target);
    }
};
function cloneAllKeys(methods) {
    return Object.fromEntries(Reflect.ownKeys(methods).map((i) => {
        const val = methods[i];
        return [i, val];
    }));
}
