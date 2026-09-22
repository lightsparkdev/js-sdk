// tsc resolves @lightsparkdev/origin's component imports against its source
// files (the package's `main` points at src/index.ts), so when we compile
// the demo it walks into Origin's *.module.scss imports. Origin ships its
// own scss shim under its src/declarations.d.ts, but TypeScript only picks
// up .d.ts files inside the current compilation root — we need our own.

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// The Sumsub WebSDK is loaded via a <script> tag from sumsub's CDN (see
// index.html). It registers a global `snsWebSdk` builder on `window`.
// We type only the subset we actually call. The global is declared
// possibly-undefined because the CDN can fail to load — callers must
// guard with `typeof snsWebSdk === "undefined"` before use.
interface SnsWebSdkBuilder {
  withConf(conf: { lang?: string; theme?: "light" | "dark" }): SnsWebSdkBuilder;
  withOptions(opts: { adaptIframeHeight?: boolean }): SnsWebSdkBuilder;
  on(event: string, handler: (payload: unknown) => void): SnsWebSdkBuilder;
  onMessage(handler: (type: string, payload: unknown) => void): SnsWebSdkBuilder;
  build(): { launch(selector: string): void };
}

interface SnsWebSdk {
  init(
    accessToken: string,
    onTokenExpired: () => Promise<string>,
  ): SnsWebSdkBuilder;
}

declare const snsWebSdk: SnsWebSdk | undefined;
