import { cloneAllKeys } from "./callable-obj";

export function MethodContextor<
  M extends object,
  I extends (...args: any[]) => void
>(
  methods: M,
  init: (this: M,...args: Parameters<I>) => void
): MethodContextor.Result<I, M> {
  const baseMethods = cloneAllKeys(methods);

  const constructor = (...args: Parameters<I>) => {
    const instance = Object.create(baseMethods);

    for (const [key, value] of Object.entries(baseMethods)) {
      try {
        if (typeof value === "function") {
          instance[key] = value.bind(instance);
        }
      } catch {}
    }

    init.call(instance, ...args);
    return instance as M;
  };

  const staticMethods = Object.create(null);
  for (const [key, value] of Object.entries(baseMethods)) {
    try {
      if (typeof value === "function") {
        staticMethods[key] = function (thisArg: M, ...args: any[]) {
          return value.apply(thisArg, args);
        };
      } else {
        staticMethods[key] = value;
      }
    } catch {}
  }

  for (const [key, value] of Object.entries(staticMethods)) {
    try {
      constructor[key] = value;
    } catch {}
  }

  return constructor as MethodContextor.Result<I, M>;
}

export namespace MethodContextor {
  export type Result<I extends (...args: any[]) => void, M> = {
    [K in keyof M]: M[K] extends (...args: infer Args) => infer R
      ? (thisArg: M, ...args: Args) => R
      : M[K];
  } & ((...args: Parameters<I>) => M);
}

export namespace example {
  const Car = MethodContextor(
    {
      speed: 0,
      name: "",
      drive(speed: number): string {
        this.speed = speed;
        return `${this.getName()} is driving at ${speed} mph`;
      },
      stop(): string {
        this.speed = 0;
        return `${this.getName()} has stopped`;
      },
      getName(): string {
        return this.name;
      },
      getSpeed(): number {
        return this.speed;
      },
      create(name: string) {
        return Car(name);
      }
    },
    function (this, name: string) {
      this.name = name;
      this.speed = 0;
    }
  );

  const myCar = Car("toyota");
  console.log(myCar.drive(60));
  console.log(myCar.stop());
  console.log(myCar.getName());
  console.log(myCar.getSpeed());

  const someCar = Car("IDK");
  console.log(Car.drive(someCar, 80));
  console.log(Car.stop(someCar));
  console.log(Car.getName(someCar));
  console.log(Car.getSpeed(someCar));
}
