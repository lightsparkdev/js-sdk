export const isError = (e: unknown): e is Error => {
  return Boolean(
    typeof e === "object" &&
      e !== null &&
      "name" in e &&
      typeof e.name === "string" &&
      "message" in e &&
      typeof e.message === "string" &&
      "stack" in e &&
      (!e.stack || typeof e.stack === "string"),
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
