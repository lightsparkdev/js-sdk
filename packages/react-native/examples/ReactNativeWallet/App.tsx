import { ReactNativeCrypto } from "@lightsparkdev/react-native";
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
      <JwtAuthProvider useLocalStorage>
        <PageContainer />
      </JwtAuthProvider>
    </LightsparkClientProvider>
  );
}
