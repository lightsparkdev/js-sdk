/* eslint-disable no-restricted-imports */
import { Theme } from "@emotion/react";
import { Interpolation } from "@emotion/styled";
import { omit } from "lodash-es";
import React, { MouseEventHandler, useCallback } from "react";
import {
  Link as RLink,
  matchPath,
  Navigate as RNavigate,
  PathMatch,
  useLocation,
  useNavigate as useRNavigate,
} from "react-router-dom";
/* eslint-enable no-restricted-imports */
import { colors } from "@lightsparkdev/ui/styles/colors";

export type QueryParams = {
  [key: string]: string;
};

type RouteParam = string;
export type RouteParams = {
  [key: string]: RouteParam | QueryParams;
};

export type RouteHash = string | null;

export type LinkProps<RoutesType extends string> = {
  to: RoutesType;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  params?: RouteParams | undefined;
  children?: React.ReactNode;
  css?: Interpolation<Theme>;
  className?: string;
  blue?: boolean;
  newTab?: boolean;
  hash?: RouteHash | undefined;
};

export function replaceParams<RoutesType extends string>(
  to: LinkProps<RoutesType>["to"],
  params: LinkProps<RoutesType>["params"]
): LinkProps<RoutesType>["to"] {
  if (params) {
    let toWithParams = to;
    Object.entries(omit(params, "query")).forEach(([key, value]) => {
      if (typeof value !== "string") {
        throw new Error(
          `Only 'query' may be an object. Route params must be a string, but '${key}' is not.`
        );
      }
      toWithParams = toWithParams.replace(`:${key}`, value) as RoutesType;
    });
    if (params.query) {
      const query = Object.entries(params.query)
        .map(([key, value]) => `${key}${value ? `=${value}` : ""}`)
        .join("&");
      toWithParams = `${toWithParams}?${query}` as RoutesType;
    }
    to = toWithParams;
  }
  return to;
}

// If `to` contains an argument like :id, inlclude the value in params object
// and it will be replaced automatically. This way route typesaftey is preserved.
export function Link<RoutesType extends string>({
  to,
  params,
  children,
  css,
  onClick,
  className,
  hash = null,
  blue = false,
  newTab = false,
}: LinkProps<RoutesType>) {
  let toStr: RoutesType | string = replaceParams(to, params);
  toStr += hash ? `#${hash}` : "";
  return (
    <RLink
      to={toStr}
      css={css}
      onClick={onClick}
      className={className}
      style={{ color: blue ? colors.blue43 : "inherit" }}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </RLink>
  );
}

type NavigateProps<RoutesType extends string> = Omit<
  LinkProps<RoutesType>,
  "children"
>;

export function Navigate<RoutesType extends string>({
  to,
  params,
}: NavigateProps<RoutesType>) {
  to = replaceParams(to, params);
  return <RNavigate to={to} />;
}

export function useNavigate<RoutesType extends string>() {
  const navigate = useRNavigate();
  return useCallback(
    (
      // number eg -1 can be passed to navigate back
      to: LinkProps<RoutesType>["to"] | number,
      params?: LinkProps<RoutesType>["params"]
    ) => {
      if (typeof to === "string") {
        to = replaceParams<RoutesType>(to, params);
        // need a separate return here to satisfy router internal types
        return navigate(to);
      }
      return navigate(to);
    },
    [navigate]
  );
}

export function useMatchRoutes<RoutesType extends string>(
  routes: RoutesType[]
): boolean {
  const location = useLocation();
  const doesMatch = routes.some((route) => matchPath(route, location.pathname));
  return doesMatch;
}

export function useFindMatchingRoute<RoutesType extends string>(
  routes: RoutesType[]
): RoutesType | undefined {
  const location = useLocation();
  const matchingRoute = routes.find((route) =>
    matchPath(route, location.pathname)
  );
  return matchingRoute;
}

export function useMatchRoute<RoutesType extends string>(
  route: RoutesType
): PathMatch<string> | null {
  const location = useLocation();
  return matchPath(route, location.pathname);
}

export function useCurrentRoute<RoutesType>(): RoutesType {
  const location = useLocation();
  return location.pathname as RoutesType;
}