export const Routes = {
  Base: "/",
  Login: "/login",
  Oauth: "/oauth",
} as const;

export type RoutesMapType = typeof Routes;
export type RoutesType = (typeof Routes)[keyof typeof Routes];
export type RouteNames = keyof typeof Routes;

/* Keep these - see LIG-5374 */
declare global {
  interface NewRoutes extends RoutesMapType {}
}
