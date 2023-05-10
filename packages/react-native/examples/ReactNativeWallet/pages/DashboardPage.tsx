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
          await clientProvider
            .getClient()
            .initializeWalletAndAwaitReady(KeyType.RSA_OAEP, keys.publicKey);
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
              .loadWalletSigningKey(privateKey);
            console.log("Loaded:", loaded);
          }}
          onSendTestPayment={async () => {
            const ampInvoice =
              "lnbcrt1pjr8xwypp5xqj2jfpkz095s8zu57ktsq8vt8yazwcmqpcke9pvl67ne9cpdr0qdqj2a5xzumnwd6hqurswqcqzpgxq9z0rgqsp55hfn0caa5sexea8u979cckkmwelw6h3zpwel5l8tn8s0elgwajss9q8pqqqssqefmmw79tknhl5xhnh7yfepzypxknwr9r4ya7ueqa6vz20axvys8se986hwj6gppeyzst44hm4yl04c4dqjjpqgtt0df254q087sjtfsq35yagj";
            const payment = await clientProvider
              .getClient()
              .payInvoice(ampInvoice, 1000, 60, 10);
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
