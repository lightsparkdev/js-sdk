import * as LightsparkdevReactNativeCrypto from "@lightsparkdev/ls-react-native-crypto";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [exportedKey, setExportedKey] =
    useState<LightsparkdevReactNativeCrypto.ExportedKeys>();
  const [keyData, setKeyData] = useState<string>("");
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
      <ScrollView>
        <Text selectable>{keyData}</Text>
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
