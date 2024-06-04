export enum TestAppRoutes {
  PageOne = "/test-app-page-one",
  PageTwo = "/test-app-page-two",
}

type TestAppRoutesType = typeof TestAppRoutes;

declare global {
  interface NewRoutes extends TestAppRoutesType {}
}

export {};
