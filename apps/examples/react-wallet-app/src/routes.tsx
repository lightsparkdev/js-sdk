export const Routes = {
  Dashboard: "/",
  Login: "/login",
} as const;

export type RoutesMapType = typeof Routes;
export type RoutesType = (typeof Routes)[keyof typeof Routes];
export type RouteNames = keyof typeof Routes;

/* Keep these - see LIG-5374 */
declare global {
  interface NewRoutes extends RoutesMapType {}
}
