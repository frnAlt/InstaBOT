export function createFunctionObject<
  P extends Record<string, any>,
  F extends (this: P, ...args: any[]) => any
>(
  func: F,
  properties: P,
  constructHandler?: (thisArg: P) => void
): F &
  P &
  (typeof constructHandler extends undefined
    ? {}
    : { new (...args: Parameters<F>): P & ReturnType<F> }) {
  if (typeof func !== "function") {
    throw new TypeError("First argument must be a function");
  }

  const functionObject = Object.assign(
    function (this: P | undefined, ...args: any[]) {
      if (constructHandler && new.target) {
        Object.assign(this, properties);
        constructHandler.call(this, this);
        const result = func.apply(this, args);
        return result && typeof result === "object" ? result : this;
      }
      return func.apply(this || functionObject, args);
    } as F,
    properties
  ) as F & P;

  const boundFunction = functionObject.bind(functionObject) as F & P;

  return new Proxy(boundFunction, {
    get: (target, prop, receiver) => Reflect.get(target, prop, receiver),
    set: (target, prop, value, receiver) => {
      if (!(prop in Function.prototype)) {
        return Reflect.set(target, prop, value, receiver);
      }
      return false;
    },
    has: (target, prop) => Reflect.has(target, prop),
    ownKeys: (target) =>
      Reflect.ownKeys(target).filter((key) => !(key in Function.prototype)),
    ...(constructHandler
      ? {
          construct(target, args) {
            return Reflect.construct(functionObject, args, target);
          },
        }
      : {}),
  }) as F &
    P &
    (typeof constructHandler extends undefined
      ? {}
      : { new (...args: Parameters<F>): P & ReturnType<F> });
}

export function createFunctionMetadata<F extends (...args: any[]) => any>(
  func: F,
  metadata: {
    description?: string;
    version?: string;
    created?: Date;
    tags?: string[];
    [key: string]: any;
  }
) {
  const metaStore = new Map<string, any>(Object.entries(metadata));

  const enhancedFunction = Object.defineProperties(func as any, {
    getMeta: {
      value: (key?: string) =>
        key ? metaStore.get(key) : Object.fromEntries(metaStore),
      enumerable: false,
    },
    setMeta: {
      value: (key: string, value: any) => {
        metaStore.set(key, value);
        return enhancedFunction;
      },
      enumerable: false,
    },
    withMeta: {
      value: (newMetadata: Record<string, any>) => {
        Object.entries(newMetadata).forEach(([k, v]) => metaStore.set(k, v));
        return enhancedFunction;
      },
      enumerable: false,
    },
  });

  return enhancedFunction as F & {
    getMeta: (key?: string) => any;
    setMeta: (key: string, value: any) => typeof enhancedFunction;
    withMeta: (metadata: Record<string, any>) => typeof enhancedFunction;
  };
}

export function composeFunctions<
  F extends (...args: any[]) => any,
  G extends (x: ReturnType<F>) => any
>(...fns: [F, G, ...Function[]]) {
  const composed = (...args: any[]) => {
    return fns.reduceRight(
      (result, fn) => [
        // @ts-ignore
        fn.apply(null, Array.isArray(result) ? result : [result]),
      ],
      args
    )[0];
  };

  Object.defineProperty(composed, "functions", {
    value: fns,
    writable: false,
  });

  return Object.assign(composed, {
    andThen: <H extends (x: ReturnType<G>) => any>(fn: H) =>
      composeFunctions(...fns, fn),
    pipe: <H extends (...args: any[]) => Parameters<F>[0]>(fn: H) =>
      composeFunctions(fn, ...fns),
    inspect: () => fns.map((fn) => fn.toString()),
  }) as typeof composed & {
    andThen: <H extends (x: ReturnType<G>) => any>(fn: H) => any;
    pipe: <H extends (...args: any[]) => Parameters<F>[0]>(fn: H) => any;
    inspect: () => string[];
    functions: Function[];
  };
}

export function trackFunction<F extends (...args: any[]) => any>(
  func: F,
  options: {
    maxHistory?: number;
    onCall?: (stats: {
      calls: number;
      lastArgs: any[];
      lastResult: any;
    }) => void;
  } = {}
) {
  const history: { args: any[]; result: any; timestamp: number }[] = [];
  let callCount = 0;

  const tracked = function (this: any, ...args: any[]) {
    const result = func.apply(this, args);
    callCount++;

    const entry = { args, result, timestamp: Date.now() };
    history.push(entry);
    if (options.maxHistory && history.length > options.maxHistory) {
      history.shift();
    }

    options.onCall?.({ calls: callCount, lastArgs: args, lastResult: result });
    return result;
  } as F;

  return Object.defineProperties(tracked, {
    stats: {
      get: () => ({
        callCount,
        history: [...history],
        averageExecutionTime:
          history.length > 1
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
  }) as F & {
    stats: {
      callCount: number;
      history: { args: any[]; result: any; timestamp: number }[];
      averageExecutionTime: number;
    };
    clearStats: () => void;
  };
}

export function changePrototype<C extends new (...args: any[]) => any>(
  targetClass: C,
  target: any
) {
  const newTarget = { ...target };
  Object.setPrototypeOf(newTarget, targetClass.prototype);
  return Object.create(newTarget, Object.getOwnPropertyDescriptors(target));
}
