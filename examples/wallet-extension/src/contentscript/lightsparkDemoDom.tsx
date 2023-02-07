import { CurrencyUnit } from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import ReactDOM from "react-dom";
import CurrencyAmount from "../components/CurrencyAmount";

export const updateWalletBalances = async () => {
  const { balances } = await getWalletBalances();
  if (!balances) {
    return;
  }
  ReactDOM.render(
    <CurrencyAmount
      amount={balances.viewerBalance}
      shortNumber
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      minimumFractionDigits={0}
      symbol
    />,
    document.getElementById("viewer-balance")!.lastElementChild!
  );
  ReactDOM.render(
    <CurrencyAmount
      amount={balances.creatorBalance}
      shortNumber
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      minimumFractionDigits={0}
      symbol
    />,
    document.getElementById("creator-balance")!.lastElementChild!
  );
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
