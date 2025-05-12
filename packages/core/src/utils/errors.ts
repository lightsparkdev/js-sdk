import { isObject } from "./typeGuards.js";
import { type JSONType } from "./types.js";

export const isError = (e: unknown): e is Error => {
  return Boolean(
    typeof e === "object" &&
      e !== null &&
      "name" in e &&
      typeof e.name === "string" &&
      "message" in e &&
      typeof e.message === "string",
  );
};

type ErrorWithMessage = {
  message: string;
};

export const isErrorWithMessage = (e: unknown): e is ErrorWithMessage => {
  return Boolean(
    typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof e.message === "string",
  );
};

export const getErrorMsg = (e: unknown): string => {
  return isErrorWithMessage(e) ? e.message : "Unknown error";
};

export const isErrorMsg = (e: unknown, msg: string) => {
  if (isError(e)) {
    return e.message === msg;
  }
  return false;
};

/* Make non-enumerable properties like message and stack enumerable so they
   can be handled by JSON.stringify */
function normalizeObject(obj: unknown): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  if (isObject(obj)) {
    const props = Object.getOwnPropertyNames(obj);
    for (const prop of props) {
      const objRecord = obj as Record<string, unknown>;
      normalized[prop] = objRecord[prop];
    }
  }
  return normalized;
}

export function errorToJSON(
  err: unknown,
  /* Enable stringifying non-primitives globally for subpaths.
     Useful for enforcing single level error objects: */
  stringifyObjects = false,
) {
  if (!err) {
    return null;
  }

  /* Objects can add standard toJSON method to determine JSON.stringify output, https://mzl.la/3Gks9zu: */
  if (isObject(err) && "toJSON" in err && typeof err.toJSON === "function") {
    if (stringifyObjects === true) {
      return objectToJSON(err.toJSON());
    }
    return err.toJSON() as JSONType;
  }

  if (
    typeof err === "object" &&
    /* This happens for certain errors like DOMException: */
    Object.getOwnPropertyNames(err).length === 0 &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return { message: err.message };
  }

  return objectToJSON(err);
}

function objectToJSON(obj: unknown) {
  const normalizedObj = normalizeObject(obj);
  return JSON.parse(
    JSON.stringify(normalizedObj, (key, value: unknown) => {
      /* Initial call passes the top level object with empty key: */
      if (key === "") {
        return value;
      }

      const objProps = Object.getOwnPropertyNames(normalizedObj);
      if (!objProps.includes(key)) {
        return undefined;
      }

      if (isObject(value)) {
        return JSON.stringify(value);
      }

      return value;
    }),
  ) as JSONType;
}
