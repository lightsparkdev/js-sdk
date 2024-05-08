declare global {
  const __CURRENT_COMMIT__: string;
  const __BASENAME__: string;

  /* LIG-5374 */
  interface NewRoutes {
    example: "/example";
  }
}

export type NewRoutesType = NewRoutes[keyof NewRoutes];

/* window props that may be considered common to any Lightspark web app: */
export interface LightsparkWindow extends Window {
  Cypress?: unknown;
  lightsparkRouter?: unknown;
  dev?: {
    [key: string]: unknown;
  };
  /* google tag manager. assume always defined, from index.html: */
  dataLayer: unknown[];
}

export {};
