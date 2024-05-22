import { type DebounceSettings } from "lodash";
import { debounce } from "lodash-es";
import { useEffect, useState } from "react";

export function useDebounce<T>(
  value: T,
  delay: number = 0,
  options?: DebounceSettings,
): T {
  const [current, setCurrent] = useState(value);
  const jsonOptions = JSON.stringify(options);

  useEffect(() => {
    const debounced = debounce(
      () => {
        setCurrent(value);
      },
      delay,
      options,
    );

    debounced();

    return () => {
      debounced.cancel();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [value, delay, jsonOptions]);

  return current;
}
