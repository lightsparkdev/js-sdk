import { Maybe } from "@lightsparkdev/core";
import {
  CurrencyAmount as CurrencyAmountType,
  CurrencyUnit,
  WalletDashboard,
} from "@lightsparkdev/wallet-sdk";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { CurrencyAmount } from "@lightsparkdev/ui/components/CurrencyAmount";

const Dashboard = ({
  data,
  onUnlockWallet,
  onSendTestPayment,
}: {
  data: WalletDashboard;
  onUnlockWallet: (privateKey: string) => void;
  onSendTestPayment: () => void;
}) => {
  const [privateKey, setPrivateKey] = useState<string>("");

  return (
    <Container>
      <Welcome>Welcome!</Welcome>
      <Subtitle>Your wallet's status is: {data.status}</Subtitle>
      <AmountBar>
        <AmountWithLabel
          label="Owned Balance"
          amount={data.balances?.ownedBalance}
        />
        <AmountWithLabel
          label="Sendable Balance"
          amount={data.balances?.availableToSendBalance}
        />
        <AmountWithLabel
          label="Withdrawable Balance"
          amount={data.balances?.availableToWithdrawBalance}
        />
      </AmountBar>
      <TextInput
        placeholder="Key Alias"
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        onChangeText={setPrivateKey}
        value={privateKey}
      />
      <Button
        title="Unlock Wallet"
        onPress={() => {
          onUnlockWallet(privateKey);
        }}
      />
      <Button
        title="Send test payment"
        onPress={() => {
          onSendTestPayment();
        }}
      />
    </Container>
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.container}>{children}</View>;
};

const Welcome = ({ children }: { children: React.ReactNode }) => {
  return <Text style={styles.welcome}>{children}</Text>;
};

const Subtitle = ({ children }: { children: React.ReactNode }) => {
  return <Text style={styles.subtitle}>{children}</Text>;
};

const AmountBar = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.amountBar}>{children}</View>;
};

const AmountWithLabel = ({
  label,
  amount,
}: {
  label: string;
  amount: Maybe<CurrencyAmountType>;
}) => {
  const amountOrZero = amount || {
    originalValue: 0,
    originalUnit: CurrencyUnit.SATOSHI,
    preferredCurrencyValueRounded: 0,
    preferredCurrencyValueApprox: 0,
    preferredCurrencyUnit: CurrencyUnit.USD,
  };
  return (
    <View style={styles.amountWrapper}>
      <Text style={styles.amountLabel}>{label}</Text>
      <SatAmount>
        <CurrencyAmount amount={amountOrZero} />
      </SatAmount>
      <UsdAmount>
        Est.{" "}
        <CurrencyAmount amount={amountOrZero} displayUnit={CurrencyUnit.USD} />
      </UsdAmount>
    </View>
  );
};

const SatAmount = ({ children }: { children: React.ReactNode }) => {
  return <Text style={styles.satAmount}>{children}</Text>;
};

const UsdAmount = ({ children }: { children: React.ReactNode }) => {
  return <Text style={styles.usdAmount}>{children}</Text>;
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 32,
    marginTop: 8,
  },
  amountBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  amountWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.08)",
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  satAmount: {
    fontSize: 24,
    fontWeight: "700",
    margin: 0,
  },
  usdAmount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    margin: 0,
  },
});

export default Dashboard;
