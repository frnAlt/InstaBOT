export function createCallable<
  T extends (...args: any[]) => any,
  M extends Record<string, any>
>(main: T, methods: M) {
  return createNamespace(() => methods, main);
}

export function createNamespace<
  T extends Record<string, any> | ((...args: any) => any),
  R
>(callback: (ns: T) => R, target?: T): T & R {
  const safeTarget = target ?? ({} as T);

  const result = callback(safeTarget);
  const ownKeys: (keyof R)[] = Object.getOwnPropertyNames(
    result
  ) as (keyof R)[];

  const from = Object.fromEntries(ownKeys.map((i) => [i, result[i]]));
  return Object.assign(safeTarget, from ?? ({} as R));
}

interface NamespaceConstructor {
  new <T extends (...args: any[]) => any, M extends Record<string, any>>(
    callback: (ns: T) => M,
    target: T
  ): Namespace<T, M>;
}

type Namespace<T, M> = ReturnType<typeof createNamespace<T, M>>;

export const Namespace: NamespaceConstructor = class Namespace<
  T extends (...args: any[]) => any,
  M extends Record<string, any>
> {
  constructor(callback: (ns: T) => M, target: T) {
    return createNamespace(callback, target);
  }
} as NamespaceConstructor;

export function cloneAllKeys<M extends Record<string | symbol | number, any>>(
  methods: M
): M {
  return Object.fromEntries(
    Reflect.ownKeys(methods).map((i) => {
      const val = methods[i];
      return [i, val];
    })
  );
}
