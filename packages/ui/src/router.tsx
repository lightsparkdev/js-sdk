/** @jsxImportSource @emotion/react */
/* eslint-disable no-restricted-imports */
import type { Theme } from "@emotion/react";
import type { Interpolation } from "@emotion/styled";
import styled from "@emotion/styled";
import { omit } from "lodash-es";
import type { MouseEventHandler, ReactNode } from "react";
import { useCallback } from "react";
import type { PathMatch } from "react-router-dom";
import {
  Link as RLink,
  Navigate as RNavigate,
  matchPath,
  useLocation,
  useNavigate as useRNavigate,
  type NavigateOptions,
} from "react-router-dom";
import { renderTypography } from "./components/typography/renderTypography.js";
import { type SimpleTypographyProps } from "./components/typography/types.js";
import { colors } from "./styles/colors.js";
import { type NewRoutesType } from "./types/index.js";
import { isString } from "./utils/strings.js";
/* eslint-enable no-restricted-imports */

export type QueryParams =
  | {
      [key: string]: string;
    }
  | string;

type RouteParam = string;
export type RouteParams = {
  [key: string]: RouteParam | QueryParams;
};

export type RouteHash = string | null;

export type ExternalLink = string;

export type LinkProps = {
  to?: NewRoutesType | undefined;
  id?: string | undefined;
  externalLink?: ExternalLink | undefined;
  filename?: string | undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  params?: RouteParams | undefined;
  /* Link allows children for flexibility. text may alternatively passed in with a
     specified typography, useful especially for toReactNodes contexts */
  children?: ReactNode;
  text?: string | undefined;
  css?: Interpolation<Theme>;
  className?: string;
  blue?: boolean;
  newTab?: boolean | undefined;
  hash?: RouteHash | undefined;
  typography?: SimpleTypographyProps | undefined;
};

export function replaceParams(
  to: NewRoutesType,
  params: LinkProps["params"],
): NewRoutesType {
  if (params) {
    let toWithParams = to;
    Object.entries(omit(params, "query")).forEach(([key, value]) => {
      if (typeof value !== "string") {
        throw new Error(
          `Only 'query' may be an object. Route params must be a string, but '${key}' is not.`,
        );
      }
      toWithParams = toWithParams.replace(`:${key}`, value) as NewRoutesType;
    });
    if (params.query) {
      let query = params.query;
      if (typeof query !== "string") {
        query = Object.entries(params.query)
          .map(([key, value]) => `${key}${value ? `=${value}` : ""}`)
          .join("&");
      }
      toWithParams = `${toWithParams}?${query}` as NewRoutesType;
    }
    to = toWithParams;
  }
  return to;
}

// If `to` contains an argument like :id, inlclude the value in params object
// and it will be replaced automatically. This way route typesaftey is
// preserved.
function LinkBase({
  to,
  id,
  externalLink,
  filename,
  params,
  children,
  text,
  css,
  onClick,
  className,
  hash = null,
  blue = false,
  newTab: newTabProp,
  typography,
}: LinkProps) {
  if (!isString(to) && !externalLink && !onClick) {
    throw new Error(
      "Link must have either `to` or `externalLink` or `onClick` defined",
    );
  }

  let toStr;
  let newTab = Boolean(newTabProp);
  if (isString(to)) {
    toStr = replaceParams(to, params);
    toStr += hash ? `#${hash}` : "";
  } else if (externalLink) {
    const definedExternalLink = externalLink;
    if (
      !definedExternalLink.startsWith("http") &&
      !definedExternalLink.startsWith("mailto:")
    ) {
      throw new Error("Link's externalLink must start with http or mailto:");
    }
    if (newTabProp === undefined) {
      newTab = true;
    }
    toStr = definedExternalLink;
  } else {
    toStr = "#";
  }

  let content = children;
  if (text) {
    content = typography
      ? renderTypography(typography.type, {
          size: typography.size,
          color: typography.color,
          content: text,
        })
      : text;
  }

  return (
    <RLink
      to={toStr}
      id={id}
      css={css}
      onClick={onClick}
      className={className}
      download={filename}
      style={{ color: blue ? colors.blue43 : "inherit" }}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {content}
    </RLink>
  );
}

export const Link = styled(LinkBase)``;

type NavigateProps = Omit<LinkProps, "children"> & {
  to: NewRoutesType;
  state?: unknown;
  replace?: boolean;
};

export function Navigate({
  to,
  params,
  state,
  replace = false,
}: NavigateProps) {
  to = replaceParams(to, params);
  return <RNavigate to={to} state={state} replace={replace} />;
}

export function useNavigate() {
  const navigate = useRNavigate();
  return useCallback(
    (
      // -1 can be passed to navigate back
      to: NewRoutesType | -1,
      params?: LinkProps["params"],
      options?: NavigateOptions,
    ) => {
      if (typeof to === "string") {
        to = replaceParams(to, params);
        // need a separate return here to satisfy router internal types
        return navigate(to, options);
      }
      return navigate(to);
    },
    [navigate],
  );
}

export function useMatchRoutes(routes: NewRoutesType[]): boolean {
  const location = useLocation();
  const doesMatch = routes.some((route) => matchPath(route, location.pathname));
  return doesMatch;
}

export function useFindMatchingRoute(
  routes: NewRoutesType[],
): NewRoutesType | undefined {
  const location = useLocation();
  const matchingRoute = routes.find((route) =>
    matchPath(route, location.pathname),
  );
  return matchingRoute;
}

export function useMatchRoute(route: NewRoutesType): PathMatch<string> | null {
  const location = useLocation();
  return matchPath(route, location.pathname);
}

export function useCurrentRoute(): NewRoutesType {
  const location = useLocation();
  return location.pathname as NewRoutesType;
}

export function getRouteName(
  path: NewRoutesType,
  routes: { [key: string]: string },
) {
  for (const routeName of Object.keys(routes)) {
    if (matchPath(routes[routeName], path)) {
      return routeName;
    }
  }
  return null;
}
