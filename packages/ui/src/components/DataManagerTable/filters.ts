interface FilterBase<T extends Record<string, unknown>> {
  type: FilterType;
  label: string;
  // This is the accessorKey for the column in the data
  accessorKey: keyof T;
  value?: string | boolean;
  // Placeholder for any string filters
  placeholder?: string;
  // Default error message to use when filter validation fails
  errorMessage?: string;
}

export interface DateFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.DATE;
  startQueryVariable?: string;
  endQueryVariable?: string;
}

export interface EnumFilterValue {
  label: string;
  value: string | string[];
}

export interface EnumFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.ENUM;
  enumValues: EnumFilterValue[];
  queryVariable: string;
  /**
   * Whether the filter can have multiple applied values.
   */
  isMulti?: boolean;
}

export interface StringFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.STRING;
  queryVariable: string;
  /**
   * Whether the filter can have multiple applied values.
   */
  isMulti?: boolean;
}

export interface IdFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.ID;
  allowedEntities?: string[];
  queryVariable: string;
  validation?: "uuid" | "none";
  /**
   * Whether the filter can have multiple applied values.
   */
  isMulti?: boolean;
}

export interface BooleanFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.BOOLEAN;
  queryVariable: string;
}

export interface CurrencyFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.CURRENCY;
  minQueryVariable?: string;
  maxQueryVariable?: string;
}

export interface NumberFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.NUMBER;
  queryVariable: string;
  valueType: "integer" | "float" | "decimal";
  minValue?: number;
  maxValue?: number;
}

export function isValidNumberFilterValue(
  value: string,
  filter: Pick<
    NumberFilter<Record<string, unknown>>,
    "valueType" | "minValue" | "maxValue"
  >,
) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const pattern =
    filter.valueType === "integer"
      ? /^-?\d+$/
      : filter.valueType === "float"
      ? /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/
      : /^-?(?:\d+\.?\d*|\.\d+)$/;
  if (!pattern.test(trimmed)) return false;

  const numericValue = Number(trimmed);
  return (
    Number.isFinite(numericValue) &&
    (filter.minValue === undefined || numericValue >= filter.minValue) &&
    (filter.maxValue === undefined || numericValue <= filter.maxValue)
  );
}

export interface InputObjectFilterField {
  name: string;
  label: string;
  enumValues: EnumFilterValue[];
  isMulti?: boolean;
}

export interface InputObjectFilter<T extends Record<string, unknown>>
  extends FilterBase<T> {
  type: FilterType.INPUT_OBJECT;
  queryVariable: string;
  fields: InputObjectFilterField[];
}

export type Filter<T extends Record<string, unknown>> =
  | DateFilter<T>
  | EnumFilter<T>
  | StringFilter<T>
  | IdFilter<T>
  | BooleanFilter<T>
  | CurrencyFilter<T>
  | NumberFilter<T>
  | InputObjectFilter<T>;

export enum FilterType {
  DATE = "date",
  ENUM = "enum",
  STRING = "string",
  ID = "id",
  NUMBER = "number",
  CURRENCY = "currency",
  BOOLEAN = "boolean",
  INPUT_OBJECT = "input-object",
}
