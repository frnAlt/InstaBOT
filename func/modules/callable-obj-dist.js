"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = exports.Namespace = void 0;
exports.createCallable = createCallable;
exports.createNamespace = createNamespace;
exports.cloneAllKeys = cloneAllKeys;
exports.MethodContextor = MethodContextor;
function createCallable(main, methods) {
  return createNamespace(() => methods, main);
}
function createNamespace(callback, target) {
  const safeTarget = target ?? {};
  const result = callback(safeTarget);
  const ownKeys = Object.getOwnPropertyNames(result);
  const from = Object.fromEntries(ownKeys.map((i) => [i, result[i]]));
  // @ts-ignore
  return Object.assign(safeTarget, from ?? {});
}
exports.Namespace = class Namespace {
  constructor(callback, target) {
    return createNamespace(callback, target);
  }
};
function cloneAllKeys(methods) {
  // @ts-ignore
  return Object.fromEntries(
    Reflect.ownKeys(methods).map((i) => {
      const val = methods[i];
      return [i, val];
    })
  );
}
function MethodContextor(methods, init) {
  const baseMethods = cloneAllKeys(methods);
  const constructor = (...args) => {
    const instance = Object.create(baseMethods);
    for (const [key, value] of Object.entries(baseMethods)) {
      try {
        if (typeof value === "function") {
          instance[key] = value.bind(instance);
        }
      } catch {}
    }
    init.call(instance, ...args);
    return instance;
  };
  const staticMethods = Object.create(null);
  for (const [key, value] of Object.entries(baseMethods)) {
    try {
      if (typeof value === "function") {
        staticMethods[key] = function (thisArg, ...args) {
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
  return constructor;
}
var example;
(function (example) {
  const Car = MethodContextor(
    {
      speed: 0,
      name: "",
      drive(speed) {
        this.speed = speed;
        return `${this.getName()} is driving at ${speed} mph`;
      },
      stop() {
        this.speed = 0;
        return `${this.getName()} has stopped`;
      },
      getName() {
        return this.name;
      },
      getSpeed() {
        return this.speed;
      },
      create(name) {
        return Car(name);
      },
    },
    function (name) {
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
})(example || (exports.example = example = {}));
