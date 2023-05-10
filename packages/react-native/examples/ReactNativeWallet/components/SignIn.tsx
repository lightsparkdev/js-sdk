import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const auth = useJwtAuth();

  const generateDemoTokens = async () => {
    const { token: jwt, accountId } = await fetch(
      `https://us-central1-jwt-minter.cloudfunctions.net/getJwt?userId=${userName}&password=${password}`
    ).then((res) => res.json());
    const result = await auth.login(accountId, jwt);
    if (result.wallet) {
        onSignIn();
    }
  };

  return (
    <View style={styles.container}>
      <Text>Sign in to your wallet</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUserName}
        value={userName}
        placeholder="Username"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
      />
      <Button
        // style={styles.submitButton}
        title="Sign in"
        onPress={generateDemoTokens}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: 260,
    padding: 8,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    width: 260,
  },
});
