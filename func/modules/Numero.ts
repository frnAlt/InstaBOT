/**
 * Numero Namespace Utilities
 * --------------------------
 *
 * A collection of mathematical utilities focused on numeric operations
 * involving variance, randomness, slopes, and diminishing values.
 *
 * Provides functions to apply controlled randomness to numbers,
 * simulate gradual decreases or fluctuations, and other related
 * numeric transformations commonly used in mathematical modeling,
 * simulations, and data manipulation.
 *
 * Designed for precision and flexibility in handling numeric data
 * with subtle variations.
 *
 * Author: Nealiana Kaye Cagara (@lianecagara)
 */
export namespace Numero {
  /**
   * Applies a controlled random variance to a given numeric value.
   * Perturbs the input `value` by a random factor within ±`percent` range.
   *
   * @param value - The base numeric value to which variance is applied.
   * @param percent - The maximum variance percentage as a decimal (0 to 1).
   * @returns The input `value` adjusted by a random variance factor.
   *
   * @example
   * ```ts
   * const base = 100;
   * const fluctuated = Numero.applyVariance(base, 0.2);
   * // fluctuated will be between 80 and 120 approximately.
   * ```
   */
  export function applyVariance(value: number, percent: number): number {
    percent = Math.min(Math.max(percent, 0), 1);
    const randomFactor = (Math.random() * 2 - 1) * percent;
    return value * (1 + randomFactor);
  }

  /**
   * Clamps a number within the inclusive range [min, max].
   *
   * @param min - Minimum allowed value.
   * @param desired - Value to clamp.
   * @param max - Maximum allowed value.
   * @returns Clamped number.
   *
   * @example
   * ```ts
   * Numero.clamp(0, 10, 5); // returns 5 because 10 is above max
   * Numero.clamp(0, -3, 5); // returns 0 because -3 is below min
   * Numero.clamp(0, 3, 5);  // returns 3 because 3 is within range
   * ```
   */
  export function clamp(min: number, desired: number, max: number): number {
    return Math.min(Math.max(desired, min), max);
  }

  /**
   * Returns true with the given probability.
   *
   * @param chance - Probability between 0 and 1.
   * @returns Boolean indicating if the chance hit.
   *
   * @example
   * ```ts
   * if (Numero.chance(0.25)) {
   *   console.log("25% chance event triggered");
   * }
   * ```
   */
  export function chance(chance: number): boolean {
    chance = clamp(0, chance, 1);
    return Math.random() < chance;
  }

  /**
   * Returns the largest number from the arguments.
   *
   * @param x - Numbers to compare.
   * @returns The largest number.
   *
   * @example
   * ```ts
   * Numero.largest(5, 10, 3); // returns 10
   * ```
   */
  export function largest(...x: number[]): number {
    if (x.length === 0) throw new Error("No numbers provided");
    return Math.max(...x);
  }

  /**
   * Returns the smallest number from the arguments.
   *
   * @param x - Numbers to compare.
   * @returns The smallest number.
   *
   * @example
   * ```ts
   * Numero.smallest(5, 10, 3); // returns 3
   * ```
   */
  export function smallest(...x: number[]): number {
    if (x.length === 0) throw new Error("No numbers provided");
    return Math.min(...x);
  }

  /**
   * Calculates the slope between two points (x1, y1) and (x2, y2).
   *
   * @param x1 - x-coordinate of the first point.
   * @param y1 - y-coordinate of the first point.
   * @param x2 - x-coordinate of the second point.
   * @param y2 - y-coordinate of the second point.
   * @returns Slope value (rise over run).
   *
   * @example
   * ```ts
   * const slopeValue = Numero.slope(0, 0, 2, 4); // returns 2
   * ```
   */
  export function slope(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    if (x2 === x1)
      throw new Error("Cannot calculate slope with vertical line (x1 === x2)");
    return (y2 - y1) / (x2 - x1);
  }

  /**
   * Generates a smooth fluctuating value around a base using a sine wave.
   *
   * @param base - The base value around which to fluctuate.
   * @param percent - Maximum fluctuation percentage (0 to 1).
   * @param time - Time or step parameter for fluctuation.
   * @param frequency - Number of fluctuation cycles per unit time (default 1).
   * @returns The fluctuated value at the given time.
   *
   * @example
   * ```ts
   * // At time = 0.25, with 20% fluctuation around 100:
   * const fluctuated = Numero.smoothFluctuate(100, 0.2, 0.25);
   * ```
   */
  export function smoothFluctuate(
    base: number,
    percent: number,
    time: number,
    frequency = 1
  ): number {
    percent = clamp(0, percent, 1);
    const fluctuation = Math.sin(time * 2 * Math.PI * frequency) * percent;
    return base * (1 + fluctuation);
  }

  /**
   * Applies diminishing returns to a value, approaching a maximum limit.
   *
   * @param input - The input value.
   * @param rate - Rate controlling the speed of saturation.
   * @param maxValue - Maximum possible output.
   * @returns Output with diminishing returns applied.
   *
   * @example
   * ```ts
   * // Input increases, output approaches 100 but never exceeds it:
   * const result = Numero.diminishingReturns(5, 0.5, 100);
   * ```
   */
  export function diminishingReturns(
    input: number,
    rate: number,
    maxValue: number
  ): number {
    if (input < 0) input = 0;
    return maxValue * (1 - Math.exp(-input * rate));
  }

  /**
   * Linearly interpolates between two numbers.
   *
   * @param start - Start value.
   * @param end - End value.
   * @param t - Interpolation factor between 0 and 1.
   * @returns Interpolated value.
   *
   * @example
   * ```ts
   * const mid = Numero.lerp(0, 10, 0.5); // returns 5
   * ```
   */
  export function lerp(start: number, end: number, t: number): number {
    t = clamp(0, t, 1);
    return start + (end - start) * t;
  }

  /**
   * Generates a random walk step from the current value.
   *
   * @param current - Current value.
   * @param stepSize - Maximum step size.
   * @param min - Optional minimum clamp.
   * @param max - Optional maximum clamp.
   * @returns Next value after a random step.
   *
   * @example
   * ```ts
   * let val = 50;
   * val = Numero.randomWalkStep(val, 5, 0, 100);
   * // val will move up or down by up to 5, clamped between 0 and 100.
   * ```
   */
  export function randomWalkStep(
    current: number,
    stepSize: number,
    min?: number,
    max?: number
  ): number {
    const step = (Math.random() * 2 - 1) * stepSize;
    let nextValue = current + step;
    if (min !== undefined) nextValue = Math.max(nextValue, min);
    if (max !== undefined) nextValue = Math.min(nextValue, max);
    return nextValue;
  }

  /**
   * Calculates the percentage change from oldValue to newValue.
   *
   * @param oldValue - Initial value.
   * @param newValue - New value.
   * @returns Percentage change (positive or negative).
   *
   * @example
   * ```ts
   * const change = Numero.percentChange(50, 75); // returns 50 (%)
   * ```
   */
  export function percentChange(oldValue: number, newValue: number): number {
    if (oldValue === 0)
      throw new Error("Cannot calculate percentage change from zero.");
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  }

  /**
   * Power-based diminishing returns using angleDeg to map to exponent.
   * @param value - Input value.
   * @param angleDeg - Controls the power curve (0° < angleDeg < 90°).
   * @returns Adjusted value after diminishing returns.
   */
  export function statDiminishingPower(
    value: number,
    angleDeg: number = 80
  ): number {
    if (value === 0) {
      return 0;
    }
    const MIN_ANGLE = 0.0001;
    const MAX_ANGLE = 89.9999;
    const clampedAngleDeg = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angleDeg));
    const exponent = clampedAngleDeg / 90;

    let a =
      value >= 0
        ? Math.pow(value, exponent)
        : -Math.pow(Math.abs(value), exponent);
    return a;
  }

  /**
   * Linear diminishing returns based on tan(angleDeg).
   * @param value - Input value.
   * @param angleDeg - Angle controlling the post-linear slope (0° < angleDeg < 90°).
   * @returns Adjusted value after applying slope-based diminishing.
   */
  export function statDiminishingLinear(
    value: number,
    angleDeg: number = 45
  ): number {
    if (value === 0) {
      return 0;
    }
    const MIN_ANGLE = 0.0001;
    const MAX_ANGLE = 89.9999;
    const clampedAngleDeg = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angleDeg));
    const angleRad = (clampedAngleDeg * Math.PI) / 180;
    const slope = Math.tan(angleRad);

    return value >= 0 ? value * slope : -(Math.abs(value) * slope);
  }

  /**
   * Reverse power-based diminishing to find [originalValue, angleDeg].
   * @param output - The diminished result.
   * @param input - The original input value.
   * @returns [value, angleDeg] that would result in this output.
   */
  export function reverseDiminishingPower(
    output: number,
    input: number
  ): [number, number] {
    const exponent = Math.log(output) / Math.log(input);
    const angleDeg = exponent * 90;
    return [input, angleDeg];
  }

  /**
   * Reverse linear diminishing to find [originalValue, angleDeg].
   * @param output - The diminished result.
   * @param input - The original input value.
   * @returns [value, angleDeg] that would result in this output.
   */
  export function reverseDiminishingLinear(
    output: number,
    input: number
  ): [number, number] {
    const slope = output / input;
    const angleRad = Math.atan(slope);
    const angleDeg = angleRad * (180 / Math.PI);
    return [input, angleDeg];
  }
}
