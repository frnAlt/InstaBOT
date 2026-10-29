"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigMath = void 0;
class BigMath {
    static abs(x) {
        return x < 0n ? -x : x;
    }
    static max(...values) {
        if (values.length === 0)
            throw new Error("No arguments provided");
        return values.reduce((max, val) => (val > max ? val : max));
    }
    static min(...values) {
        if (values.length === 0)
            throw new Error("No arguments provided");
        return values.reduce((min, val) => (val < min ? val : min));
    }
    static clamp(x, min, max) {
        if (min > max)
            throw new Error("min must be less than or equal to max");
        return x < min ? min : x > max ? max : x;
    }
    static sign(x) {
        return x === 0n ? 0n : x > 0n ? 1n : -1n;
    }
    static add(a, b) {
        return a + b;
    }
    static sub(a, b) {
        return a - b;
    }
    static mul(a, b) {
        return a * b;
    }
    static div(a, b) {
        if (b === 0n)
            throw new Error("Division by zero");
        return a / b;
    }
    static mod(a, b) {
        if (b === 0n)
            throw new Error("Division by zero");
        return a % b;
    }
    static pow(base, exponent) {
        if (exponent < 0n)
            throw new Error("Exponent must be non-negative");
        return base ** exponent;
    }
    static floor(x) {
        return x;
    }
    static ceil(x) {
        return x;
    }
    static round(x) {
        return x;
    }
    static sqrt(x) {
        if (x < 0n)
            throw new Error("Square root of negative bigint");
        if (x < 2n)
            return x;
        let low = 1n;
        let high = x;
        while (low <= high) {
            const mid = (low + high) / 2n;
            const square = mid * mid;
            if (square === x)
                return mid;
            else if (square < x)
                low = mid + 1n;
            else
                high = mid - 1n;
        }
        return high;
    }
}
exports.BigMath = BigMath;
