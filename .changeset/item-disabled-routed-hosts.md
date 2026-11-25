---
"@lightsparkdev/origin": patch
---

Item: disabled items now strip `to` and `externalLink` and flag router render hosts disabled, so links that derive their href from either (e.g. `LinkBase`) cannot be opened in a new tab. Disabled items also narrow the render contract: activation handlers, keyboard semantics, and hrefs are removed from every render host.
