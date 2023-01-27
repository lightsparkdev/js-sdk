import styled from "@emotion/styled";
import {
  CurrencyAmount,
  SingeNodeDashboardQuery,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import "./App.css";
import { Maybe } from "./common/types";
import CurrencyAmountRaw from "./components/CurrencyAmountRaw";
import TransactionRow from "./components/TransactionRow";
import { getLightsparkClient } from "./lightsparkClientProvider";

enum Screen {
  Balance,
  Transactions,
}

function App() {
  const [walletDashboard, setWalletDashboard] =
    React.useState<SingeNodeDashboardQuery>();
  const [screen, setScreen] = React.useState<Screen>(Screen.Balance);

  React.useEffect(() => {
    chrome.storage.local
      .get(["walletDashboard"])
      .then(async (cachedBalance) => {
        if (cachedBalance) {
          setWalletDashboard(cachedBalance.walletDashboard);
        }
        const client = getLightsparkClient();
        await client
          .getWalletDashboard(
            "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599"
          )
          .then((dashboard) => {
            setWalletDashboard(dashboard);
            chrome.storage.local.set({ walletDashboard: dashboard });
          });
      });
  }, []);

  const body =
    screen === Screen.Balance ? (
      <BalanceScreen 
        balance={walletDashboard?.current_account?.blockchain_balance?.available_balance}
      />
    ) : (
      <TransactionsScreen transactions={walletDashboard?.current_account?.recent_transactions.edges.map((it) => it.entity) || []}/>
    );
  return (
    <div className="app-wrapper">
      {Header(screen, setScreen)}
      <div className="content-wrapper">{body}</div>
    </div>
  );
}

function Header(screen: Screen, setScreen: (screen: Screen) => void) {
  if (screen === Screen.Balance) {
    return (
      <div className="header">
        <img
          src="lightspark_full.png"
          className="app-logo"
          alt="Lightspark logo"
        />
        <button onClick={() => setScreen(Screen.Transactions)}>≔</button>
      </div>
    );
  }
  return (
    <div className="header">
      <img
          src="lightspark_full.png"
          className="app-logo"
          alt="Lightspark logo"
        />
      <button onClick={() => setScreen(Screen.Balance)}>$</button>
    </div>
  );
}

function BalanceScreen(props: {balance: Maybe<CurrencyAmount>}) {
  const screenContent = !props.balance ? (
    <div className="loading-text">Loading wallet...</div>
  ) : (
    <div className="balance">
      <CurrencyAmountRaw
        shortNumber
        shortUnit
        value={props.balance?.value}
        unit={props.balance?.unit}
      ></CurrencyAmountRaw>
    </div>
  );
  return (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  }}>
    {screenContent}
  </div>
  );
}

function TransactionsScreen(props: {transactions: TransactionDetailsFragment[]}) {
  return (
    <div style={{width: "100%"}}>
      {props.transactions.map((transaction) => (
        <TransactionRow transaction={transaction} />
      ))}
    </div>
  );
}

export default App;
