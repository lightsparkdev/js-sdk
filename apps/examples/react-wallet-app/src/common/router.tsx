import {
  Link as LinkBase,
  Navigate as NavigateBase,
  replaceParams as replaceParamsBase,
  useCurrentRoute as useCurrentRouteBase,
  useFindMatchingRoute as useFindMatchingRouteBase,
  useMatchRoute as useMatchRouteBase,
  useMatchRoutes as useMatchRoutesBase,
  useNavigate as useNavigateBase,
  type LinkProps as LinkPropsBase,
} from "@lightsparkdev/ui/router";
import { RoutesType } from "src/routes";

export const replaceParams = replaceParamsBase<RoutesType>;
export const Link = LinkBase<RoutesType>;
export const Navigate = NavigateBase<RoutesType>;
export const useNavigate = useNavigateBase<RoutesType>;
export const useMatchRoutes = useMatchRoutesBase<RoutesType>;
export const useFindMatchingRoute = useFindMatchingRouteBase<RoutesType>;
export const useMatchRoute = useMatchRouteBase<RoutesType>;
export const useCurrentRoute = useCurrentRouteBase<RoutesType>;
export type LinkProps = LinkPropsBase<RoutesType>;
