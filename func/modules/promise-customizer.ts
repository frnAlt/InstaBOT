export type ModifierMap = Record<string, (...args: any[]) => any>;

export type ModifierResults<T extends ModifierMap> = {
  [K in keyof T]?: ReturnType<T[K]>;
};

export type ModifierMerge<T extends ModifierMap, S> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => S;
};

/**
 * Creates an enhanced promise with custom modifiers and lazy execution
 * @template T The type of the value the promise resolves to
 * @template C The type of the modifier map
 * @param customizer A map of modifier functions
 * @param executor The promise executor function
 * @returns A promise with attached modifiers
 * @author lianecagara https://github.com/lianecagara
 */
export function createEnhancedPromise<T, C extends ModifierMap>(
  customizer: C,
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    modifiers: ModifierResults<C>
  ) => void
): Promise<T> & ModifierMerge<C, Promise<T>> {
  let internalPromise: Promise<T> | null = null;
  const modifiers: ModifierResults<C> = {};
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
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
      if (!isStarted) {
        isStarted = true;
        internalPromise = new Promise<T>((resolve, reject) => {
          executor(resolve, reject, modifiers);
        });
      }
      return internalPromise!.then(onfulfilled, onrejected);
    },

    /**
     * Handles rejection of the promise
     * @template TResult The type of the rejection result
     * @param onrejected Optional callback for when the promise is rejected
     * @returns A new promise with the result of the callback
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<T | TResult> {
      if (!isStarted) {
        isStarted = true;
        internalPromise = new Promise<T>((resolve, reject) => {
          executor(resolve, reject, modifiers);
        });
      }
      return internalPromise!.catch(onrejected);
    },

    /**
     * Executes a callback regardless of the promise's outcome
     * @param onfinally Optional callback to execute when the promise settles
     * @returns A new promise with the original value
     */
    finally(onfinally?: (() => void) | null): Promise<T> {
      if (!isStarted) {
        isStarted = true;
        internalPromise = new Promise<T>((resolve, reject) => {
          executor(resolve, reject, modifiers);
        });
      }
      return internalPromise!.finally(onfinally);
    },
  } as Promise<T>;

  for (const key in customizer) {
    Object.defineProperty(enhancedPromise, key, {
      value: (...args: any[]) => {
        modifiers[key] = customizer[key](...args);
        return enhancedPromise;
      },
      writable: false,
      configurable: true,
    });
  }

  return enhancedPromise as Promise<T> & ModifierMerge<C, Promise<T>>;
}

/**
 * Factory for creating enhanced promises with predefined modifiers
 * @template T The type of the modifier map
 * @author lianecagara https://github.com/lianecagara
 */
export class PromiseEnhancer<T extends ModifierMap> {
  constructor(public customizer: T) {}

  /**
   * Creates an enhanced promise with the configured modifiers
   * @template P The type of the value the promise resolves to
   * @param executor The promise executor function
   * @returns A promise instance with the configured modifiers
   */
  create<P>(
    executor: (
      resolve: (value: P | PromiseLike<P>) => void,
      reject: (reason?: any) => void,
      modifiers: ModifierResults<T>
    ) => void
  ): Promise<P> & ModifierMerge<T, Promise<P>> {
    return createEnhancedPromise(this.customizer, executor);
  }
}

export type EnhancedPromiseType<
  T,
  M extends PromiseEnhancer<ModifierMap>
> = Promise<T> & ModifierMerge<M["customizer"], Promise<T>>;

/**
 * Example usage with a threading mode modifier
 */
export namespace example {
  const CustomPromise = new PromiseEnhancer({
    /**
     * Sets the execution mode for the promise
     * @param m The mode, either "thread" (delayed) or "immediate" (default)
     * @returns The selected mode
     */
    mode(m: "thread" | "immediate" = "immediate") {
      return m;
    },
  });

  /**
   * Creates an enhanced promise that resolves a message with a configurable execution mode
   * @param msg The message to process
   * @returns An enhanced promise resolving to the message
   */
  export function customPromise(
    msg: string
  ): EnhancedPromiseType<string, typeof CustomPromise> {
    return CustomPromise.create<string>((resolve, _reject, modifiers) => {
      if (modifiers.mode === "thread") {
        setTimeout(() => resolve(msg.repeat(5)), 1000);
      } else {
        resolve(msg);
      }
    });
  }

  /**
   * Runs example usage of customPromise with different modes
   */
  export async function runExamples() {
    const result1 = await customPromise("test").then((value) => value);
    console.log(result1);

    const result2 = await customPromise("test")
      .mode("thread")
      .then((value) => value);
    console.log(result2);
  }
}
