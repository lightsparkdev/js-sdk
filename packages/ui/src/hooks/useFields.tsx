import { isValidUmaAddress } from "@uma-sdk/core";
import { diff } from "deep-object-diff";
import { isObject } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ValidatorFn = (
  value: string,
  fields?: Fields<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
) => string | false;
type Validators = {
  [key: string]: (msg?: string, ...args: unknown[]) => ValidatorFn;
};

type FieldValue = string;
export type FieldValueArg = FieldValue | [FieldValue, boolean | ValidatorFn[]];
export type FieldArgs<V extends FieldValueArg> = Record<string, V>;
type Fields<T> = Record<keyof T, FieldValue>;

const defaultMsgs = {
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
  postalCode: "Please enter a valid zip code.",
  state: "Please enter a valid two-letter state abbreviation.",
  name: "Name must be at least three characters.",
  code: "Code must be eight characters long.",
  password:
    "Password must be at least 12 characters, must contain at least two types of characters: lowercase, uppercase, numbers, special",
  required: "This field is required.",
  umaAddress: "Please enter a valid UMA address.",
  matchesField: "Target field does not match.",
  clabe: "Please enter a valid CLABE.",
  upi: "Please enter a valid UPI.",
  domain: "Please enter a valid domain.",
  domainName: "Please enter a valid domain name.",
  url: "Please enter a valid URL.",
};

const regexp = {
  phone: /^[2-9]{1}[0-9]{9}$/,
  postalCode: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  state:
    /^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/,
  clabe: /^[0-9]{18}$/,
  upi: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
  domain:
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  domainName: /^[a-zA-Z0-9-]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

export const v: Validators = {
  email:
    (msg = defaultMsgs.email) =>
    (value) =>
      !regexp.email.test(value) ? msg : false,
  domain:
    (msg = defaultMsgs.domain) =>
    (value) =>
      !regexp.domain.test(value) || value.length > 253 ? msg : false,
  domainName:
    (msg = defaultMsgs.domainName) =>
    (value) =>
      !regexp.domainName.test(value) || value.length > 63 ? msg : false,
  url:
    (msg = defaultMsgs.url) =>
    (value) =>
      !regexp.url.test(value) ? msg : false,
  phone:
    (msg = defaultMsgs.phone) =>
    (value) =>
      !regexp.phone.test(value) ? msg : false,
  postalCode:
    (msg = defaultMsgs.postalCode) =>
    (value) =>
      !regexp.postalCode.test(value) ? msg : false,
  state:
    (msg = defaultMsgs.state) =>
    (value) =>
      !regexp.state.test(value) ? msg : false,
  name:
    (msg = defaultMsgs.name) =>
    (value) =>
      value.trim().length < 3 ? msg : false,
  code:
    (msg = defaultMsgs.code) =>
    (value) =>
      value.trim().length !== 8 ? msg : false,
  umaAddress:
    (msg = defaultMsgs.umaAddress) =>
    (value) =>
      !isValidUmaAddress(value) ? msg : false,
  clabe:
    (msg = defaultMsgs.clabe) =>
    (value) =>
      !regexp.clabe.test(value) ? msg : false,
  upi:
    (msg = defaultMsgs.upi) =>
    (value) =>
      !regexp.upi.test(value) ? msg : false,
  required:
    (msg = defaultMsgs.required) =>
    (value) =>
      value.trim() === "" ? msg : false,
  min:
    (msg, minLength = 3) =>
    (value) => {
      const len = typeof minLength === "number" ? minLength : 3;
      return value.trim().length < len
        ? msg || `Must be at least ${len} characters long.`
        : false;
    },
  length:
    (msg, length = 3) =>
    (value) => {
      const len = typeof length === "number" ? length : 3;
      return value.trim().length !== len
        ? msg || `Must be ${len} characters long.`
        : false;
    },
  matchesField:
    (msg = defaultMsgs.matchesField, targetField = "") =>
    (value, fields) => {
      if (typeof targetField !== "string") {
        return msg;
      }
      return value !== fields?.[targetField] ? msg : false;
    },
};

/* Optional validation is colocated here for consistency.
 * For example multiple forms may need client side
 * validation for email, and by providing "email" as one of the keys to
 * useFields they will share the same validation method.
 * Alternatively a component may pass in a field that's only relevant locally
 * and not defined here. We can expand the hook to allow inline validation
 * methods passed in with useFields if it becomes a common use case. */
const defaultValidators: Record<string, ValidatorFn[]> = {
  password: [
    v.required("Password is required."),
    // This needs to stay as 8 otherwise users with old shorter passwords
    // can't login.
    v.min("Password must be at least eight characters.", 8),
  ],
  city: [v.required("City is required.")],
  name: [v.required("Name is required."), v.name()],
  code: [v.required("Please enter a code."), v.code()],
  email: [v.required("Email is required."), v.email()],
  phoneNumber: [v.required("Phone number is required."), v.phone()],
  multiInput: [v.required("This field is required.")],
  birthdayDay: [v.min("Day is required.", 1)],
  birthdayMonth: [v.min("Day is required.", 1)],
  birthdayYear: [v.min("Day is required.", 4)],
  postalCode: [v.required("Zip code is required."), v.postalCode()],
  addressCountryCode: [v.required("Country code is required.")],
  addressLine1: [v.required("Address is required.")],
  addressLine2: [],
  addressCity: [v.required("City is required.")],
  addressState: [v.required("State is required.")],
  addressZipCode: [v.required("Zip code is required.")],
};

const f = {
  numeric: (value: string) => value.replace(/[^0-9]/g, ""),
};

const defaultFormatters: Record<string, (value: string) => string> = {
  birthdayDay: f.numeric,
  birthdayMonth: f.numeric,
  birthdayYear: f.numeric,
};

function getFirstFieldError<V extends FieldValueArg, T extends FieldArgs<V>>(
  fieldName: keyof T,
  fieldValue: string,
  fields: Fields<T>,
  validatorsArg?: boolean | ValidatorFn[],
) {
  /* Using default validation for fields can be enabled conditionally for convenience. Enabled by
   * default but also ese default validation when explicitly set to true: */
  if (typeof validatorsArg === "undefined" || validatorsArg === true) {
    /* No custom validators - check for default validation based on field name or return null */
    const validators = defaultValidators[fieldName as string];
    if (validators) {
      for (const validator of validators) {
        const errorMsg = validator(fieldValue, fields);
        if (errorMsg) {
          return errorMsg;
        }
      }
    }
  } else if (typeof validatorsArg !== "undefined") {
    if (validatorsArg === false) {
      /* Caller is requesting no validation for a field that has validators by default */
      return null;
    }
    for (const validator of validatorsArg) {
      const errorMsg = validator(fieldValue, fields);
      if (errorMsg) {
        return errorMsg;
      }
    }
  }
  return null;
}

function reduceToUndef<T extends Record<string, unknown>>(fields: T) {
  return Object.keys(fields).reduce(
    (acc, key) => ({ ...acc, [key]: undefined }),
    {},
  ) as { [P in keyof T]: undefined };
}

function reduceToFalse<T extends Record<string, unknown>>(fields: T) {
  return Object.keys(fields).reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {},
  ) as { [P in keyof T]: boolean };
}

function reduceToFields<V extends FieldValueArg, T extends FieldArgs<V>>(
  fields: T,
) {
  return Object.entries(fields).reduce((acc, [key, fieldValueArg]) => {
    if (typeof fieldValueArg === "string") {
      return { ...acc, [key]: fieldValueArg };
    }
    return { ...acc, [key]: fieldValueArg[0] };
  }, {} as Fields<T>);
}

export default function useFields<
  V extends FieldValueArg,
  T extends FieldArgs<V>,
>(defaultFieldsFn: () => T, deps: unknown[] = []) {
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const defaultFields = useMemo(defaultFieldsFn, deps);
  const prevDefaultFields = useRef(defaultFields);

  const [fields, setFields] = useState(reduceToFields(defaultFields));
  const [fieldErrors, setFieldErrors] = useState(reduceToUndef(defaultFields));
  const [blurredFields, setBlurredFields] = useState(
    reduceToFalse(defaultFields),
  );

  const checkFieldForError = useCallback(
    (fieldName: string, fieldValue: string) => {
      const defaultField = defaultFields[fieldName];
      const customValidators =
        typeof defaultField === "string" ? undefined : defaultField[1];
      const fieldError = getFirstFieldError(
        fieldName,
        fieldValue,
        fields,
        customValidators,
      );
      /**
       * field must have been blurred at least once before we show any
       * validation error:
       */
      if (blurredFields[fieldName]) {
        setFieldErrors((currentFieldErrors) => ({
          ...currentFieldErrors,
          [fieldName]: fieldError,
        }));
      }
      return fieldError;
    },
    [defaultFields, blurredFields, fields],
  );

  const checkFieldsForError = useCallback(
    (fieldsToCheck: Partial<T>) => {
      Object.entries(fieldsToCheck).forEach(([key, value]) => {
        checkFieldForError(key, value as string);
      });
    },
    [checkFieldForError],
  );

  const setFieldBlurred = useCallback(
    (fieldName: keyof T) => {
      const newBlurredFields = {
        ...blurredFields,
        [fieldName]: true,
      };
      setBlurredFields(newBlurredFields);
    },
    [blurredFields],
  );

  const getSetFieldBlurred = useCallback(
    (fieldName: keyof T) => {
      return () => {
        setFieldBlurred(fieldName);
      };
    },
    [setFieldBlurred],
  );

  const formatValue = useCallback((fieldName: keyof T, value: string) => {
    const formatter = defaultFormatters[fieldName as string];
    return formatter ? formatter(value) : value;
  }, []);

  const mergeWithFields = useCallback(
    (updatedFields: Partial<T>) => {
      setFields((latestFields) => {
        const formatted = Object.entries(updatedFields).reduce(
          (acc, [key, value]) => {
            const val =
              typeof value === "string"
                ? value
                : Array.isArray(value) && typeof value[0] === "string"
                ? value[0]
                : "";
            return {
              ...acc,
              [key]: formatValue(key, val),
            } as Partial<T>;
          },
          {} as Partial<T>,
        );

        const updated = {
          ...latestFields,
          ...formatted,
        };
        const fieldsChanged =
          JSON.stringify(updated) !== JSON.stringify(latestFields);

        /* Prevent rerender if fields are identical - return same ref to ensure memoized: */
        return fieldsChanged ? updated : latestFields;
      });
      checkFieldsForError(updatedFields);
    },
    [checkFieldsForError, formatValue],
  );

  const allFieldsValid = useMemo(() => {
    const valid = !Object.entries(fields).some(([fieldName, fieldValue]) => {
      const defaultField = defaultFields[fieldName];
      const customValidators =
        typeof defaultField === "string" ? undefined : defaultField[1];
      const firstFieldError = getFirstFieldError(
        fieldName,
        fieldValue,
        fields,
        customValidators,
      );
      return firstFieldError;
    });

    return valid;
  }, [fields, defaultFields]);

  const getUpdateField = useCallback(
    (fieldName: keyof T) => {
      return (newValue: string) => {
        mergeWithFields({
          [fieldName]: formatValue(fieldName, newValue),
        } as Partial<T>);
      };
    },
    [mergeWithFields, formatValue],
  );

  useEffect(() => {
    const newFields: Record<string, string> = {};
    const diffProps = diff(prevDefaultFields.current, defaultFields);
    /* Check only for string updates to fields. Validator changes are already up to date via
     * defaultFields. */
    Object.entries(diffProps).forEach(([key, value]) => {
      if (typeof value === "string") {
        newFields[key] = value;
      } else if (isObject(value)) {
        /* then diff represents a change to an array type field definition */
        Object.entries(value).forEach(([arrayKey, arrayValue]) => {
          if (arrayKey === "0" && typeof arrayValue === "string") {
            /* then we are updating the string value of the field: */
            newFields[key] = arrayValue;
          }
        });
      }
    });
    if (Object.keys(newFields).length > 0) {
      mergeWithFields(newFields as Partial<T>);
    }
    prevDefaultFields.current = defaultFields;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFields, mergeWithFields]);

  useEffect(() => {
    checkFieldsForError(fields as Partial<T>);
  }, [blurredFields, fields, checkFieldsForError]);

  return {
    blurredFields,
    getUpdateField,
    allFieldsValid,
    fieldErrors,
    /* needs to be a new object to ensure downstream effects are notified on updates: */
    fields: {
      ...fields,
    },
    mergeWithFields,
    checkFieldForError,
    setFieldBlurred,
    getSetFieldBlurred,
    setFieldErrors,
  };
}
