import {
  CurrencyUnit,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import ReactDOM from "react-dom";
import CurrencyAmount from "../components/CurrencyAmount";
import TransactionLogRow from "../components/TransactionLogRow";

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

export const updateTransactionRow = async (
  transaction: TransactionDetailsFragment
) => {
  const rowWrapper = document.createElement("div");
  ReactDOM.render(<TransactionLogRow transaction={transaction} />, rowWrapper);
  const list = document.getElementById("transaction-log");
  if (!list) {
    console.warn("Trying to update transaction row without transaction log element");
    return;
  }
  const existingRow = list.querySelector(
    `[data-transaction-id="${transaction.id}"]`
  );
  if (existingRow) {
    list.replaceChild(rowWrapper.firstChild!, existingRow);
  } else {
    list.appendChild(rowWrapper.firstChild!);
  }
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
