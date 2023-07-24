import * as LightsparkdevReactNativeCrypto from "@lightsparkdev/ls-react-native-crypto";
import { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { TextEncoder } from "text-encoding";

export default function App() {
  const [exportedKey, setExportedKey] =
    useState<LightsparkdevReactNativeCrypto.ExportedKeys>();
  const [keyData, setKeyData] = useState<string>("");
  const [nonce, setNonce] = useState<string>();
  const [signature, setSignature] = useState<string>();
  const [mnemonic, setMnemonic] =
    useState<LightsparkdevReactNativeCrypto.Mnemonic>();
  const [seed, setSeed] = useState<LightsparkdevReactNativeCrypto.Seed>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h2}>RSA Keystore Functions:</Text>
      <Text>Your key alias in the keystore is:</Text>
      <Text>{exportedKey?.alias ?? "no key yet"}</Text>
      <Button
        onPress={async () =>
          setExportedKey(
            await LightsparkdevReactNativeCrypto.generateSigningKeyPair()
          )
        }
        title="Generate Key"
      />
      <Button
        onPress={async () =>
          setKeyData(
            JSON.stringify(
              await LightsparkdevReactNativeCrypto.serializeSigningKey(
                exportedKey?.alias ?? ""
              )
            )
          )
        }
        title="Serialize Key"
      />
      <Button
        onPress={async () => {
          const testMessageBytes = new TextEncoder().encode(
            "hello world test payload"
          );
          setSignature(
            await LightsparkdevReactNativeCrypto.sign(
              exportedKey?.alias ?? "",
              LightsparkdevReactNativeCrypto.b64encode(testMessageBytes)
            )
          );
        }}
        title="Sign test string"
      />
      <Button
        onPress={async () =>
          setNonce(`${await LightsparkdevReactNativeCrypto.getNonce()}`)
        }
        title="Get Nonce"
      />
      <Text style={styles.h2}>Remote Signing Functions:</Text>
      <Button
        onPress={async () =>
          setMnemonic(
            await LightsparkdevReactNativeCrypto.generateMnemonic(undefined)
          )
        }
        title="Generate Mnemonic"
      />
      <Button
        onPress={async () =>
          setSeed(await LightsparkdevReactNativeCrypto.getSeed(mnemonic!))
        }
        title="Get Seed"
      />
      <Button
        onPress={async () =>
          setKeyData(
            `${await LightsparkdevReactNativeCrypto.derivePublicKey(
              seed!,
              "m"
            )}`
          )
        }
        title="Derive Public Key"
      />
      <Button
        onPress={async () => {
          const testMessageBytes = new TextEncoder().encode(
            "hello world test payload"
          );
          setSignature(
            `${await LightsparkdevReactNativeCrypto.deriveKeyAndSign(
              seed!,
              testMessageBytes,
              "m",
              undefined,
              undefined
            )}`
          );
        }}
        title="Sign Message"
      />
      <Button
        onPress={async () =>
          setKeyData(
            `${await LightsparkdevReactNativeCrypto.ecdh(
              seed!,
              "m",
              "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8"
            )}`
          )
        }
        title="ECDH"
      />
      <ScrollView>
        {keyData && (
          <>
            <Text style={styles.label}>Key: </Text>
            <Text selectable>{keyData}</Text>
          </>
        )}
        {nonce && (
          <>
            <Text style={styles.label}>Nonce: </Text>
            <Text selectable>{nonce}</Text>
          </>
        )}
        {signature && (
          <>
            <Text style={styles.label}>Signature: </Text>
            <Text selectable>{signature}</Text>
          </>
        )}
        {mnemonic && (
          <>
            <Text style={styles.label}>Mnemonic: </Text>
            <Text selectable>{mnemonic?.phrase}</Text>
          </>
        )}
        {seed && (
          <>
            <Text style={styles.label}>Seed: </Text>
            <Text selectable>{seed?.seedBytes}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "bold",
  },
  h2: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
});
