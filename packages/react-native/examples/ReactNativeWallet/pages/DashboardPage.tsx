import { KeyOrAlias } from "@lightsparkdev/core";
import { ReactNativeCrypto } from "@lightsparkdev/react-native";
import { useJwtAuth, useLightsparkClient } from "@lightsparkdev/react-wallet";
import {
  KeyType,
  WalletDashboard,
  WalletStatus,
} from "@lightsparkdev/wallet-sdk";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Dashboard from "../components/Dashboard";
import useWalletInfo from "../hooks/useWalletInfo";

export default function DashboardPage({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const { wallet, refresh: refreshWallet } = useWalletInfo();
  const clientProvider = useLightsparkClient();
  const [dashboard, setDashboard] = useState<WalletDashboard>();
  const auth = useJwtAuth();

  useEffect(() => {
    if (!wallet) {
      return;
    }
    const client = clientProvider.getClient();
    client
      .getWalletDashboard()
      .then((dashboard) => {
        if (dashboard) {
          setDashboard(dashboard);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [wallet, clientProvider]);

  let content;
  if (loading) {
    content = <Text>Loading...</Text>;
  } else if (!dashboard || dashboard.status === WalletStatus.FAILED) {
    content = <Text>Something went wrong :-(</Text>;
  } else if (
    dashboard.status === WalletStatus.NOT_SETUP ||
    dashboard.status === WalletStatus.DEPLOYING
  ) {
    content = (
      <DeployWallet
        status={wallet?.status || WalletStatus.FAILED}
        onDeploy={async () => {
          setLoading(true);
          await clientProvider.getClient().deployWalletAndAwaitDeployed();
          await refreshWallet();
          setLoading(false);
        }}
      />
    );
  } else if (
    dashboard.status === WalletStatus.DEPLOYED ||
    dashboard.status === WalletStatus.INITIALIZING
  ) {
    content = (
      <InitializeWallet
        status={wallet?.status || WalletStatus.FAILED}
        onInitialize={async () => {
          setLoading(true);
          const keys = await ReactNativeCrypto.generateSigningKeyPair();
          // You can save the keys somewhere here if you want to use them later. Here,
          // we're just logging them to the console for demo purposes.
          console.log("Save these keys if you want to use this wallet later!");
          console.log("Public key:", keys.publicKey);
          console.log("Private key:", keys.privateKey);
          console.log("Alias:", keys.keyAlias ?? "none");
          await clientProvider
            .getClient()
            .initializeWalletAndAwaitReady(
              KeyType.RSA_OAEP,
              keys.publicKey as string,
              KeyOrAlias.alias(keys.keyAlias)
            );
          await refreshWallet();
          setLoading(false);
        }}
      />
    );
  } else {
    content = (
      <View style={styles.container}>
        <View>
          <Button
            title="Sign out"
            onPress={async () => {
              await auth.logout();
              onSignOut();
            }}
          />
        </View>
        <Dashboard
          data={dashboard}
          onUnlockWallet={async (privateKey: string) => {
            const loaded = await clientProvider
              .getClient()
              .loadWalletSigningKey(KeyOrAlias.alias(privateKey));
            console.log("Loaded:", loaded);
          }}
          onSendTestPayment={async () => {
            const invoice = await clientProvider
              .getClient()
              .createTestModeInvoice(0, "Thanks for the test money!");
            if (!invoice) {
              console.error("Failed to create test invoice.");
              return;
            }
            console.log("Paying test invoice:", invoice);
            const payment = await clientProvider
              .getClient()
              .payInvoice(invoice, 100_000, 100_000);
            console.log(`Payment done with ID = ${payment?.id}`);
          }}
        />
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const DeployWallet = ({
  onDeploy,
  status,
}: {
  onDeploy: () => void;
  status: WalletStatus;
}) => {
  return (
    <View>
      <Text>Wallet not yet deployed. Status: {status}</Text>
      <Button title="Deploy Wallet" onPress={onDeploy} />
    </View>
  );
};

const InitializeWallet = ({
  onInitialize,
  status,
}: {
  onInitialize: () => void;
  status: WalletStatus;
}) => {
  return (
    <View>
      <Text>Wallet not yet initialized. Status: {status}</Text>
      <Button title="Initialize Wallet" onPress={onInitialize} />
    </View>
  );
};

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
