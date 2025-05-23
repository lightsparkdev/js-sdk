import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import {
  useCallback,
  useState,
  type ComponentProps,
  type FocusEvent,
} from "react";
import { type TextInputBorderRadius } from "../styles/fields.js";
import { countryCodesToNames } from "../utils/countryCodesToNames.js";
import { TextInput } from "./TextInput.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

const countries = getCountries();
const defaultOptions = countries
  .map((countryCode) => {
    return {
      value: countryCode,
      label: `${getCountryCallingCode(countryCode)} (${
        countryCodesToNames[countryCode]
      })`,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function getSelectWidth(value: CountryCode, pxPerChar: number) {
  const label = getCountryCallingCode(value);
  const chars = label.length;
  return chars * pxPerChar + 30;
}

export type PhoneInputOnChangeArg = {
  number: string;
  countryCallingCode: string;
  nationalNumber: string;
  formatted: string;
  isValid: boolean;
};

type PhoneInputProps = {
  pxPerChar?: number;
  borderRadius?: TextInputBorderRadius | undefined;
  onChange?: ({
    number,
    countryCallingCode,
    nationalNumber,
    formatted,
    isValid,
  }: PhoneInputOnChangeArg) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  error?: string | undefined;
  typography?: PartialSimpleTypographyProps | undefined;
  defaultCountryCode?: CountryCode;
};

export function PhoneInput({
  typography,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  error: errorProp,
  pxPerChar = 6,
  defaultCountryCode = "US",
  borderRadius = 8 as TextInputBorderRadius,
}: PhoneInputProps) {
  /* countryCode only controls the country used for parsing phone number input. User may
     still enter or paste the country phone code */
  const [countryCode, setCountryCode] =
    useState<CountryCode>(defaultCountryCode);
  const [value, setValue] = useState("");
  const [width, setWidth] = useState(getSelectWidth(countryCode, pxPerChar));
  const [wasBlurred, setWasBlurred] = useState(false);

  const onChangeSelect = useCallback(
    (newValue: string) => {
      setCountryCode(newValue as CountryCode);
      const newWidth = getSelectWidth(newValue as CountryCode, pxPerChar);
      setWidth(newWidth);
    },
    [setCountryCode, setWidth, pxPerChar],
  );

  const options = defaultOptions.map((option) => {
    if (option.value === countryCode) {
      return {
        ...option,
        label: `+ ${getCountryCallingCode(countryCode)}`,
      };
    }
    return option;
  });

  const onChange = useCallback<ComponentProps<typeof TextInput>["onChange"]>(
    (newValue) => {
      /* Prevent putting the formatter into international mode, which
         causes an undesirable formatting style. We can still derive the number
         with the correct international code from the formatter without it. */
      const parsedValue = newValue.startsWith("+")
        ? newValue.slice(1)
        : newValue;
      const formatter = new AsYouType(countryCode);
      const formattedValue = formatter.input(parsedValue);
      setValue(formattedValue);
      const phoneNumber = formatter.getNumber();

      if (onChangeProp && phoneNumber) {
        onChangeProp({
          number: phoneNumber.number,
          countryCallingCode: phoneNumber.countryCallingCode,
          nationalNumber: phoneNumber.nationalNumber,
          formatted: formattedValue,
          isValid: phoneNumber.isValid(),
        });
      }
    },
    [setValue, countryCode, onChangeProp],
  );

  const formatter = new AsYouType(countryCode);
  const formattedValue = formatter.input(value);
  const isValidPhone = formatter.isValid();

  const error =
    !isValidPhone && wasBlurred
      ? "Please enter a valid phone number."
      : undefined;

  return (
    <TextInput
      select={{
        options,
        value: countryCode,
        onChange: onChangeSelect,
        width,
        height: 54,
      }}
      pattern="[0-9,]*"
      inputMode="numeric"
      value={formattedValue}
      onFocus={(focusEvent) => {
        if (onFocusProp) {
          onFocusProp(focusEvent);
        }
      }}
      onBlur={(blurEvent) => {
        setWasBlurred(true);
        if (onBlurProp) {
          onBlurProp(blurEvent);
        }
      }}
      onChange={onChange}
      error={errorProp || error}
      typography={typography}
      borderRadius={borderRadius}
      borderWidth={0.5}
      paddingY={13.5}
    />
  );
}
