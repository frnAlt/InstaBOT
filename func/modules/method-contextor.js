"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = void 0;
exports.MethodContextor = MethodContextor;
const callable_obj_1 = require("./callable-obj");
function MethodContextor(methods, init) {
    const baseMethods = (0, callable_obj_1.cloneAllKeys)(methods);
    const constructor = (...args) => {
        const instance = Object.create(baseMethods);
        for (const [key, value] of Object.entries(baseMethods)) {
            try {
                if (typeof value === "function") {
                    instance[key] = value.bind(instance);
                }
            }
            catch { }
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
            }
            else {
                staticMethods[key] = value;
            }
        }
        catch { }
    }
    for (const [key, value] of Object.entries(staticMethods)) {
        try {
            constructor[key] = value;
        }
        catch { }
    }
    return constructor;
}
var example;
(function (example) {
    const Car = MethodContextor({
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
        }
    }, function (name) {
        this.name = name;
        this.speed = 0;
    });
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
