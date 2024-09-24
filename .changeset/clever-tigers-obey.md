---
"@lightsparkdev/ui": patch
---

- Add several components and hooks
- Upgrade Typescript to 5.6.2
- Remove remaining generic type arguments for Routes - replaced with interface extension in downstream apps via NewRoutesType
- Remove generic typography arguments, using simpler/better inference via TypographyPropsWithoutContent type
- Improve and simplify toReactNodes
- Add CurrencyAmount as an available toReactNodes node
