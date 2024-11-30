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
  /* Google Tag Manager: */
  dataLayer?: unknown[];
  gaGlobal?: {
    /* Google Analytics Client ID: */
    vid: string;
    from_cookie: boolean;
  };
  /* Google Recaptcha adds a global window property, so assume always defined from index.html */
  grecaptcha?: {
    enterprise: {
      ready(cb: unknown): unknown;
      execute(sk: string, cb: unknown): Promise<string>;
    };
  };
}

export {};
