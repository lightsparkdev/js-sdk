import { type ComponentPropsWithRef } from "react";

/** Value in different formats */
export type UseNumberInputOnChangeValues = {
  /**
   * Value as float or null if empty
   *
   * Example:
   *   "1.99" > 1.99
   *   "" > null
   */
  float: number | null;

  /**
   * Value after applying formatting
   *
   * Example: "1000000" > "1,000,0000"
   */
  formatted: string;

  /** Non formatted value as string */
  value: string;
};

export type IntlConfig = {
  locale: string;
  currency?: string;
};

type InputProps = ComponentPropsWithRef<"input">;

export type UseNumberInputArgs = {
  /** Allow decimals */
  allowDecimals?: boolean | undefined;
  /** Allow user to enter negative value */
  allowNegativeValue?: boolean | undefined;
  /** Maximum characters the user can enter */
  maxLength?: number | undefined;
  /** Limit length of decimals allowed */
  decimalsLimit?: number | undefined;

  /**
   * Specify decimal scale for padding/trimming
   *
   * Example:
   *   1.5 -> 1.50
   *   1.234 -> 1.23
   */
  decimalScale?: number | undefined;
  /** Default value if not passing in value via props */
  defaultValue?: number | string | undefined;

  /**
   * Value will always have the specified length of decimals
   *
   * Example:
   *   123 -> 1.23
   *
   * Note: This formatting only happens onBlur
   */
  fixedDecimalLength?: number | undefined;

  /** Handle change in value */
  onChange?:
    | ((value: string, values?: UseNumberInputOnChangeValues) => void)
    | undefined;

  /** Include a prefix eg. £ */
  prefix?: string | undefined;
  /** Include a suffix eg. € */
  suffix?: string | undefined;
  /** Incremental value change on arrow down and arrow up key press */
  step?: number | undefined;
  /** Separator between integer part and fractional part of value. This cannot be a number */
  decimalSeparator?: string | undefined;
  /** Separator between thousand, million and billion. This cannot be a number */
  groupSeparator?: string | undefined;

  /** Disable auto adding separator between values eg. 1000 -> 1,000 */
  disableGroupSeparators?: boolean | undefined;
  /** Disable abbreviations (m, k, b) */
  disableAbbreviations?: boolean | undefined;

  /**
   * International locale config, examples:
   *   { locale: 'ja-JP', currency: 'JPY' }
   *   { locale: 'en-IN', currency: 'INR' }
   *
   * Any prefix, groupSeparator or decimalSeparator options passed in
   * will override Intl Locale config
   */
  intlConfig?: IntlConfig | undefined;

  /** Transform the raw value form the input before parsing */
  transformRawValue?: ((rawValue: string) => string) | undefined;

  /**
   * When set to false, the formatValueOnBlur flag disables the application of the
   * __onChange__ function specifically on blur events. If disabled or set to false, the
   * onChange will not trigger on blur. Default = true
   */
  formatValueOnBlur?: boolean | undefined;

  /* text input props: */
  ref?: InputProps["ref"];
  min?: InputProps["min"];
  max?: InputProps["max"];
  value?: InputProps["value"];
};
