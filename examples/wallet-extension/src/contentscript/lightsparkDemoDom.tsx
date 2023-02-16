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
  const viewerbalanceElement = document.getElementById("viewer-balance");
  const creatorBalanceElement = document.getElementById("creator-balance");
  if (!balances || !viewerbalanceElement || !creatorBalanceElement) {
    return;
  }
  ReactDOM.render(
    <CurrencyAmount
      amount={balances.viewerBalance}
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      symbol
    />,
    viewerbalanceElement.lastElementChild!
  );
  ReactDOM.render(
    <CurrencyAmount
      amount={balances.creatorBalance}
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      minimumFractionDigits={0}
      symbol
    />,
    creatorBalanceElement.lastElementChild!
  );
};

const transactions = new Map<string, TransactionDetailsFragment>();

export const updateTransactionRows = async (
  changedTransactions: TransactionDetailsFragment[]
) => {
  changedTransactions.forEach((transaction) => {
    transactions.set(transaction.id, transaction);
  });
  const rowWrapper = document.createElement("div");
  ReactDOM.render((
    <>
      {Array.from(transactions.values()).sort((a, b) => b.created_at.localeCompare(a.created_at)).map((transaction) => {
        return (
          <TransactionLogRow transaction={transaction} />
        );
      })}
    </>
    ),
    rowWrapper
  );
  const list = document.getElementById("transaction-log");
  if (!list) {
    console.warn("Trying to update transaction row without transaction log element");
    return;
  }
  const header = list.firstChild!;
  list.replaceChildren(header, ...Array.from(rowWrapper.childNodes.values()));
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
