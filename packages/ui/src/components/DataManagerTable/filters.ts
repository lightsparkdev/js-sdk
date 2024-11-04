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

export type Filter<T extends Record<string, unknown>> =
  | DateFilter<T>
  | EnumFilter<T>
  | StringFilter<T>
  | IdFilter<T>
  | BooleanFilter<T>;

export enum FilterType {
  DATE = "date",
  ENUM = "enum",
  STRING = "string",
  ID = "id",
  NUMBER = "number",
  BOOLEAN = "boolean",
}
