import {
  CurrencyAmount,
  CurrencyUnit,
  TransactionDetailsFragment,
  TransactionStatus,
} from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import ReactDOM from "react-dom";
import { OmitTypename } from "../common/types";
import CurrencyAmountElement from "../components/CurrencyAmount";
import TransactionLogRow from "../components/TransactionLogRow";

type Balances = {
  viewerBalance: OmitTypename<CurrencyAmount>;
  creatorBalance: OmitTypename<CurrencyAmount>;
};
let initialBalances: Balances | null = null;

export const updateWalletBalances = async () => {
  const { balances } = await getWalletBalances();
  initialBalances = balances;
  renderBalances(balances);
};

export const renderBalances = async (balances: Balances | null) => {
  const viewerbalanceElement = document.getElementById("viewer-balance");
  const creatorBalanceElement = document.getElementById("creator-balance");
  if (!balances || !viewerbalanceElement || !creatorBalanceElement) {
    return;
  }
  ReactDOM.render(
    <CurrencyAmountElement
      amount={balances.viewerBalance}
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      symbol
    />,
    viewerbalanceElement.lastElementChild!
  );
  ReactDOM.render(
    <CurrencyAmountElement
      amount={balances.creatorBalance}
      shortUnit
      displayUnit={CurrencyUnit.Satoshi}
      minimumFractionDigits={0}
      symbol
    />,
    creatorBalanceElement.lastElementChild!
  );
};

let successfulTransactionCount = 0;
const transactions = new Map<string, TransactionDetailsFragment>();

export const updateTransactionRows = async (
  changedTransactions: TransactionDetailsFragment[]
) => {
  changedTransactions.forEach((transaction) => {
    transactions.set(transaction.id, transaction);
  });
  const rowWrapper = document.createElement("div");
  ReactDOM.render(
    <>
      {Array.from(transactions.values())
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((transaction) => {
          return <TransactionLogRow transaction={transaction} />;
        })}
    </>,
    rowWrapper
  );
  const list = document.getElementById("transaction-log");
  if (!list) {
    console.warn(
      "Trying to update transaction row without transaction log element"
    );
    return;
  }
  const header = list.firstChild!;
  list.replaceChildren(header, ...Array.from(rowWrapper.childNodes.values()));
  const succesfulTransactions = Array.from(transactions.values()).filter(
    (t) => t.status === TransactionStatus.Success
  ).length;
  if (successfulTransactionCount < succesfulTransactions) {
    successfulTransactionCount = succesfulTransactions;
    onTransactionSuccess();
    const paymentBarElement = document.getElementById("payment-channel-bar");
    if (paymentBarElement) {
      paymentBarElement.classList.remove("paying");
      requestAnimationFrame(() => {
        paymentBarElement.classList.add("paying");
      });
    }
  }
  fakeBalanceChanges();
};

const onTransactionSuccess = () => {
  const backgroundPulse = document.getElementById("background-pulse");
  if (!backgroundPulse) {
    return;
  }
  backgroundPulse.style.transform = "scale(1.5, 1.1)";
  setTimeout(() => {
    backgroundPulse.style.transform = "scale(1, 1)";
  }, 250);
};

const fakeBalanceChanges = () => {
  if (!initialBalances) {
    return;
  }

  console.log("initialBalances", JSON.stringify(initialBalances))
  let viewerBalanceValue = initialBalances.viewerBalance.value;
  let creatorBalanceValue = initialBalances.creatorBalance.value;
  for (const t of Array.from(transactions.values())) {
    if (t.status === TransactionStatus.Success) {
      viewerBalanceValue -= t.amount.value;
      creatorBalanceValue += t.amount.value;
    }
  }
  console.log("new values", JSON.stringify({ viewerBalanceValue, creatorBalanceValue }))
  renderBalances({
    viewerBalance: { ...initialBalances.viewerBalance, value: viewerBalanceValue },
    creatorBalance: { ...initialBalances.creatorBalance, value: creatorBalanceValue },
  });
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
