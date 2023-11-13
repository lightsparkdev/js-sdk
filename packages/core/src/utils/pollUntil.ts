import { isFunction } from "lodash-es";
import { sleep } from "./sleep.js";

function getDefaultMaxPollsError() {
  return new Error("pollUntil: Max polls reached");
}

type GetValueResult<T> = {
  stopPolling: boolean;
  value: null | T;
};

export async function pollUntil<D extends () => Promise<unknown>, T>(
  asyncFn: D,
  getValue: (
    data: Awaited<ReturnType<D>>,
    response: { stopPolling: boolean; value: null | T },
  ) => GetValueResult<T>,
  maxPolls = 60,
  pollIntervalMs = 500,
  ignoreErrors: boolean | ((e: unknown) => boolean) = false,
  getMaxPollsError: (maxPolls: number) => Error = getDefaultMaxPollsError,
): Promise<T> {
  let polls = 0;
  let stopPolling = false;
  let result: GetValueResult<T> = {
    stopPolling: false,
    value: null,
  };
  while (!stopPolling) {
    polls += 1;
    if (polls > maxPolls) {
      stopPolling = true;
      const maxPollsError = getMaxPollsError(maxPolls);
      throw maxPollsError;
    }
    try {
      const asyncResult = await asyncFn();
      result = getValue(asyncResult as Awaited<ReturnType<D>>, {
        stopPolling: false,
        value: null,
      });
      if (result.stopPolling) {
        stopPolling = true;
      }
    } catch (e) {
      if (!ignoreErrors || (isFunction(ignoreErrors) && !ignoreErrors(e))) {
        stopPolling = true;
        throw e;
      }
    }
    await sleep(pollIntervalMs);
  }
  return result.value as T;
}
