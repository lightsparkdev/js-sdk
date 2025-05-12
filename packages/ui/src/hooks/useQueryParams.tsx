import { useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useQueryParamBoolean(param: string) {
  const queryParams = useQueryParams();
  return useMemo(() => queryParams.get(param) === "1", [queryParams, param]);
}

export function useQueryParamBooleans<K extends string>(
  params: Record<K, string>,
) {
  const queryParams = useQueryParams();
  const prevParams = useRef<Record<K, string>>(params);
  const memoizedParams = useMemo(() => {
    if (JSON.stringify(params) !== JSON.stringify(prevParams.current)) {
      prevParams.current = params;
    }
    return prevParams.current;
  }, [params]);

  const value = useMemo(() => {
    const result = {} as Record<K, boolean | undefined>;
    for (const key in memoizedParams) {
      const param = memoizedParams[key];
      const value = queryParams.get(param);

      if (value === "1" || value === "true") {
        result[key] = true;
      } else if (value === "0" || value === "false") {
        result[key] = false;
      } else if (value === "") {
        /* param exists in url without a value, set to true */
        result[key] = true;
      } else {
        /* param is not in url */
        result[key] = undefined;
      }
    }
    return result;
  }, [queryParams, memoizedParams]);

  return value;
}
