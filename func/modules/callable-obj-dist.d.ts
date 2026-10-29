export declare function createCallable<
  T extends (...args: any[]) => any,
  M extends Record<string, any>
>(main: T, methods: M): T & M;
export declare function createNamespace<
  T extends Record<string, any> | ((...args: any) => any),
  R
>(callback: (ns: T) => R, target?: T): T & R;
interface NamespaceConstructor {
  new <T extends (...args: any[]) => any, M extends Record<string, any>>(
    callback: (ns: T) => M,
    target: T
  ): Namespace<T, M>;
}
type Namespace<T, M> = ReturnType<typeof createNamespace<T, M>>;
export declare const Namespace: NamespaceConstructor;
export declare function cloneAllKeys<
  M extends Record<string | symbol | number, any>
>(methods: M): M;
export declare function MethodContextor<
  M extends object,
  I extends (...args: any[]) => void
>(
  methods: M,
  init: (this: M, ...args: Parameters<I>) => void
): MethodContextor.Result<I, M>;
export declare namespace MethodContextor {
  type Result<I extends (...args: any[]) => void, M> = {
    [K in keyof M]: M[K] extends (...args: infer Args) => infer R
      ? (thisArg: M, ...args: Args) => R
      : M[K];
  } & ((...args: Parameters<I>) => M);
}
export declare namespace example {}
export {};
