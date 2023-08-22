export function clamp(val: number, min: number, max: number): number {
  return val > max ? max : val < min ? min : val;
}

export function linearInterpolate(
  value: number,
  fromRangeStart: number,
  fromRangeEnd: number,
  toRangeStart: number,
  toRangeEnd: number,
) {
  const fromRangeMax = fromRangeEnd - fromRangeStart;
  const fromRangeVal = value - fromRangeStart;
  const toRangeMax = toRangeEnd - toRangeStart;
  const val = (fromRangeVal / fromRangeMax) * toRangeMax + toRangeStart;
  return clamp(
    val,
    Math.min(toRangeStart, toRangeEnd),
    Math.max(toRangeStart, toRangeEnd),
  );
}

/* https://stackoverflow.com/a/48764436 */
export function round(num: number, decimalPlaces = 0) {
  const p = Math.pow(10, decimalPlaces);
  const n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}
