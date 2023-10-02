import { isFunction } from "lodash-es";
import { sleep } from "./sleep.js";

function getDefaultMaxPollsError() {
  return new Error("pollUntil: Max polls reached");
}

export function pollUntil<D extends () => Promise<unknown>, T>(
  asyncFn: D,
  getValue: (
    data: Awaited<ReturnType<D>>,
    response: { stopPolling: boolean; value: null | T },
  ) => {
    stopPolling: boolean;
    value: null | T;
  },
  maxPolls = 60,
  pollIntervalMs = 500,
  ignoreErrors: boolean | ((e: unknown) => boolean) = false,
  getMaxPollsError: (maxPolls: number) => Error = getDefaultMaxPollsError,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let polls = 0;
    let stopPolling = false;
    (async function () {
      while (!stopPolling) {
        polls += 1;
        if (polls > maxPolls) {
          stopPolling = true;
          const maxPollsError = getMaxPollsError(maxPolls);
          reject(maxPollsError);
          break;
        }
        try {
          const asyncResult = await asyncFn();
          const result = getValue(asyncResult as Awaited<ReturnType<D>>, {
            stopPolling: false,
            value: null,
          });
          if (result.stopPolling) {
            stopPolling = true;
            resolve(result.value as T);
          }
        } catch (e) {
          if (!ignoreErrors || (isFunction(ignoreErrors) && !ignoreErrors(e))) {
            stopPolling = true;
            reject(e);
          }
        }
        await sleep(pollIntervalMs);
      }
    })();
  });
}
