import * as LightsparkdevReactNativeCrypto from "@lightsparkdev/ls-react-native-crypto";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [exportedKey, setExportedKey] =
    useState<LightsparkdevReactNativeCrypto.ExportedKeys>();
  const [keyData, setKeyData] = useState<string>("");
  const [mnemonic, setMnmonic] = useState<LightsparkdevReactNativeCrypto.Mnemonic>();
  const [seed, setSeed] = useState<LightsparkdevReactNativeCrypto.Seed>();
  return (
    <View style={styles.container}>
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
        onPress={async () =>
          setKeyData(
            await LightsparkdevReactNativeCrypto.sign(
              exportedKey?.alias ?? "",
              "hello world test payload"
            )
          )
        }
        title="Sign test string"
      />
      <Button
        onPress={async () =>
          setKeyData(`${await LightsparkdevReactNativeCrypto.getNonce()}`)
        }
        title="Get Nonce"
      />
      <Button
        onPress={async () =>
            setMnmonic(await LightsparkdevReactNativeCrypto.generateMnemonic())
        }
        title="Generate Mnemonic"
      />
      <Button
        onPress={async () =>
            setSeed(
                await LightsparkdevReactNativeCrypto.getSeed(mnemonic!)
            )
        }
        title="Get Seed"
      />
      <Button
        onPress={async () =>
            setKeyData(
                `${await LightsparkdevReactNativeCrypto.derivePublicKey(seed!, "m")}`
            )
        }        
        title="Derive Public Key"
      />
      <Button
        onPress={async () =>
            setKeyData(
                `${await LightsparkdevReactNativeCrypto.deriveKeyAndSign(
                    seed!, seed!.seed, "m", undefined, undefined
                )}`
            )
        }        
        title="Sign Message"
      />
      <Button
        onPress={async () =>
            setKeyData(
                `${await LightsparkdevReactNativeCrypto.ecdh(
                    seed!, "m", "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8"
                )}`
            )
        }        
        title="ECDH"
      />
      <ScrollView>
        <Text selectable>{keyData}</Text>
        <Text selectable>{mnemonic?.mnemonic}</Text>
        <Text selectable>{seed?.seed}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
});
