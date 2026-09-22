---
"@lightsparkdev/origin": patch
---

Add a `render` prop to `Breadcrumb.Link` via Base UI's `useRender`, so consumers can swap the default anchor for a router-aware link component (e.g. `render={<Link to="/settings" />}`). Props merge per Base UI semantics: classNames join, event handlers compose, refs merge.
