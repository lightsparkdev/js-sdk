# The Lightspark JS+TS React Wallet package

A thin wrapper around the Lightspark JS+TS Wallet SDK which offers convenient React hooks that simplify usage for React apps.

## Getting started

To use the package, you'll need to install it from npm:

```bash
$ npm install @lightsparkdev/react-wallet
```

The entry-point to the package is the `LightsparkClientProvider` component, which can be imported from the root package. It should be placed at the root of your React app, and will provide the `LightsparkClient` instance to all child components via the `useLightsparkClient()` hook.

```tsx
// App.tsx
function App(props: { children: React.ReactNode }) {
  return (
    <div className="App">
      <LightsparkClientProvider>
        <JwtAuthProvider useLocalStorage>{props.children}</JwtAuthProvider>
      </LightsparkClientProvider>
    </div>
  );
}
```

By wrapping your app's content in the `LightsparkClientProvider`, you can then use the `useLightsparkClient()` hook to access the singleton `LightsparkClient` instance from any child component:

```tsx
// DashboardPage.tsx
function DashboardPage() {
  const lightsparkClient = useLightsparkClient();
  const [dashboard, setDashboard] = useState<WalletDashboard | null>(null);

  useEffect(() => {
    lightsparkClient
      .getClient()
      .getWalletDashboard.then((walletDashboard) =>
        setDashboard(walletDashboard)
      );
  }, [lightsparkClient]);

  return <WalletDashboard data={dashboard} />;
}
```

## Authentication

The `JwtAuthProvider` component is used to authenticate with the user's Lightspark account. The `useLocalStorage` prop will store the access token in local storage, so that the user doesn't need to re-authenticate when they refresh the page. To initialize the client, you'll need to provide your Company Account ID and a JWT for the user. You can set this up from the [Lightspark API Tokens page](https://app.lightspark.com/api-config). For more info on JWT authentication, see the [Lightspark Wallet Authentication docs](https://app.lightspark.com/docs/api/wallet/authentication).

First, you'll need to create a JWT for the user. This can be done from your server, For example, to create a JWT from a typescript+node server:

```typescript
import * as jwt from "jsonwebtoken";

// Create a JSON object that contains the claims for your JWT.
const claims = {
  aud: "https://api.lightspark.com",
  // Any unique identifier for the user.
  sub: "511c7eb8-9afe-4f69-989a-8d1113a33f3d",
  // True to use the test environment, false to use the production environment.
  test: true,
  iat: 1516239022,
  // Expriation time for the JWT.
  exp: 1799393363,
};

// Call the `sign()` method on the `jsonwebtoken` library, passing in the JSON object and your private key.
const token = jwt.sign(claims, "your private key");

// Now send the token back to the client so that they can use it to authenticate with the Lightspark SDK.
```

Then from the client, you can use the jwt and `useJwtAuth` hook to authenticate with the user's Lightspark account:

```tsx
// LoginPage.tsx
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useJwtAuth();

  useEffect(() => {
    auth.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        navigate("/");
      }
    });
  }, [auth, navigate]);

  const from = location.state?.from?.pathname || "/";

  function handleLogin(jwt: string) {
    auth.login(ACCOUNT_ID, jwt).then(() => {
      // Send them back to the page they tried to visit when they were redirected to the login page.
      navigate(from, { replace: true });
    });
  }

  retun <LoginContent onLogin={handleLogin} />
};
```

If you want to restore the user's session when they refresh the page, you can use the `useLocalStorage` prop to store the JWT in local storage. Then, when the user refreshes the page, the `JwtAuthProvider` will automatically restore the JWT access token from local storage and re-authenticate the if the token hasn't expired yet.

Now that you're authenticated, you can actually use the lightsparkClient to make requests! See the [Lightspark Wallet SDK README](../wallet-sdk/README.md) for more info on the available methods.

## React Native

By default the Lightspark SDKs' crypto implementation does not work on React Native. To use this library on React Native, see the [react-native package](../react-native/README.md), which offers a React Native-compatible crypto implementation that can be used with these hooks like:

```tsx
import { ReactNativeCrypto } from "@lightsparkdev/react-native";
import {
  JwtAuthProvider,
  LightsparkClientProvider,
} from "@lightsparkdev/react-wallet";
import PageContainer from "./PageContainer";

export default function App() {
  return (
    <LightsparkClientProvider customCryptoImpl={ReactNativeCrypto}>
      <JwtAuthProvider useLocalStorage>
        <PageContainer />
      </JwtAuthProvider>
    </LightsparkClientProvider>
  );
}
```
