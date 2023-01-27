import { SingeNodeDashboardQuery } from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import "./App.css";
import CurrencyAmountRaw from "./components/CurrencyAmountRaw";
import { getLightsparkClient } from "./lightsparkClientProvider";

function App() {
  const [walletDashboard, setWalletDashboard] =
    React.useState<SingeNodeDashboardQuery>();

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

  const balance =
    walletDashboard?.current_account?.blockchain_balance?.available_balance;
  const body = !walletDashboard ? (
    <div className="loading-text">Loading wallet...</div>
  ) : (
    <div className="balance">
      <CurrencyAmountRaw
        shortNumber
        shortUnit
        value={balance?.value}
        unit={balance?.unit}
      ></CurrencyAmountRaw>
    </div>
  );
  return (
    <div className="app-wrapper">
      <img src="lightspark_full.png" className="app-logo" />
      <div className="content-wrapper">{body}</div>
    </div>
  );
}

export default App;
