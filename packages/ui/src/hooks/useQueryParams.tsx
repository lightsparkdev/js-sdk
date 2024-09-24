import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useQueryParamBoolean(param: string) {
  const queryParams = useQueryParams();
  return useMemo(() => queryParams.get(param) === "1", [queryParams, param]);
}
