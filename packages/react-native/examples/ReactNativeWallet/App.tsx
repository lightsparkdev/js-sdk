import {
  EncryptedLocalTokenStorage,
  ReactNativeCrypto,
} from "@lightsparkdev/react-native";
import {
  JwtAuthProvider,
  LightsparkClientProvider,
} from "@lightsparkdev/react-wallet";
import PageContainer from "./PageContainer";

export default function App() {
  return (
    <LightsparkClientProvider
      serverUrl="api.dev.dev.sparkinfra.net"
      customCryptoImpl={ReactNativeCrypto}
    >
      <JwtAuthProvider tokenStorage={new EncryptedLocalTokenStorage()}>
        <PageContainer />
      </JwtAuthProvider>
    </LightsparkClientProvider>
  );
}
