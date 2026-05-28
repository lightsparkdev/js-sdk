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
