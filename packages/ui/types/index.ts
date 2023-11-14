declare global {
  const __CURRENT_COMMIT__: string;
}

/* window props that may be considered common to any Lightspark web app: */
export interface LightsparkWindow extends Window {
  dev?: {
    [key: string]: unknown;
  };
  /* google tag manager. assume always defined, from index.html: */
  dataLayer: unknown[];
}

export {};
