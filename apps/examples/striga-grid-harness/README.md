# Striga Grid harness

An example app for exercising the Grid APIs with a Striga-backed platform.
It provides account, payment, verification, and authentication flows alongside
a request/response log.

From the JavaScript workspace root:

```bash
yarn install
yarn workspace @lightsparkdev/origin build:styles
yarn workspace @lightsparkdev/striga-grid-harness dev
```

Open <http://localhost:3108> and use **Settings** to enter your Grid API base URL
and API credentials. The base URL includes the API version path. Restart the
dev server after changing the target host.

The dev server stores credentials in
`~/.config/lightspark/striga-grid-harness.json`, outside the repository. It
injects authentication into API requests and omits secrets from responses to
the browser. To use an existing credentials file, set
`GRID_HARNESS_CREDS_FILE` to its path before starting the server.

Use a platform configured for the Striga capabilities you want to exercise.
API credentials and any customer identifiers must belong to the selected
environment.
