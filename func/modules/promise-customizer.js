"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = exports.PromiseEnhancer = void 0;
exports.createEnhancedPromise = createEnhancedPromise;
/**
 * Creates an enhanced promise with custom modifiers and lazy execution
 * @template T The type of the value the promise resolves to
 * @template C The type of the modifier map
 * @param customizer A map of modifier functions
 * @param executor The promise executor function
 * @returns A promise with attached modifiers
 * @author lianecagara https://github.com/lianecagara
 */
function createEnhancedPromise(customizer, executor) {
    let internalPromise = null;
    const modifiers = {};
    let isStarted = false;
    const enhancedPromise = {
        /**
         * Handles fulfillment and rejection of the promise
         * @template TResult1 The type of the fulfilled result
         * @template TResult2 The type of the rejected result
         * @param onfulfilled Optional callback for when the promise is fulfilled
         * @param onrejected Optional callback for when the promise is rejected
         * @returns A new promise with the result of the callbacks
         */
        then(onfulfilled, onrejected) {
            if (!isStarted) {
                isStarted = true;
                internalPromise = new Promise((resolve, reject) => {
                    executor(resolve, reject, modifiers);
                });
            }
            return internalPromise.then(onfulfilled, onrejected);
        },
        /**
         * Handles rejection of the promise
         * @template TResult The type of the rejection result
         * @param onrejected Optional callback for when the promise is rejected
         * @returns A new promise with the result of the callback
         */
        catch(onrejected) {
            if (!isStarted) {
                isStarted = true;
                internalPromise = new Promise((resolve, reject) => {
                    executor(resolve, reject, modifiers);
                });
            }
            return internalPromise.catch(onrejected);
        },
        /**
         * Executes a callback regardless of the promise's outcome
         * @param onfinally Optional callback to execute when the promise settles
         * @returns A new promise with the original value
         */
        finally(onfinally) {
            if (!isStarted) {
                isStarted = true;
                internalPromise = new Promise((resolve, reject) => {
                    executor(resolve, reject, modifiers);
                });
            }
            return internalPromise.finally(onfinally);
        },
    };
    for (const key in customizer) {
        Object.defineProperty(enhancedPromise, key, {
            value: (...args) => {
                modifiers[key] = customizer[key](...args);
                return enhancedPromise;
            },
            writable: false,
            configurable: true,
        });
    }
    return enhancedPromise;
}
/**
 * Factory for creating enhanced promises with predefined modifiers
 * @template T The type of the modifier map
 * @author lianecagara https://github.com/lianecagara
 */
class PromiseEnhancer {
    customizer;
    constructor(customizer) {
        this.customizer = customizer;
    }
    /**
     * Creates an enhanced promise with the configured modifiers
     * @template P The type of the value the promise resolves to
     * @param executor The promise executor function
     * @returns A promise instance with the configured modifiers
     */
    create(executor) {
        return createEnhancedPromise(this.customizer, executor);
    }
}
exports.PromiseEnhancer = PromiseEnhancer;
/**
 * Example usage with a threading mode modifier
 */
var example;
(function (example) {
    const CustomPromise = new PromiseEnhancer({
        /**
         * Sets the execution mode for the promise
         * @param m The mode, either "thread" (delayed) or "immediate" (default)
         * @returns The selected mode
         */
        mode(m = "immediate") {
            return m;
        },
    });
    /**
     * Creates an enhanced promise that resolves a message with a configurable execution mode
     * @param msg The message to process
     * @returns An enhanced promise resolving to the message
     */
    function customPromise(msg) {
        return CustomPromise.create((resolve, _reject, modifiers) => {
            if (modifiers.mode === "thread") {
                setTimeout(() => resolve(msg.repeat(5)), 1000);
            }
            else {
                resolve(msg);
            }
        });
    }
    example.customPromise = customPromise;
    /**
     * Runs example usage of customPromise with different modes
     */
    async function runExamples() {
        const result1 = await customPromise("test").then((value) => value);
        console.log(result1);
        const result2 = await customPromise("test")
            .mode("thread")
            .then((value) => value);
        console.log(result2);
    }
    example.runExamples = runExamples;
})(example || (exports.example = example = {}));
