import {
  CurrencyAmount,
  TransactionDetailsFragment,
  TransactionStatus,
} from "@lightspark/js-sdk/generated/graphql";
import ReactDOM from "react-dom";
import { OmitTypename } from "../common/types";

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

const renderBalances = async (balances: Balances | null) => {
  if (!balances) {
    return;
  }
  window.postMessage(
    {
      type: "FROM_CONTENT_SCRIPT",
      id: "balances_changed",
      viewerBalance: balances.viewerBalance,
      creatorBalance: balances.creatorBalance,
    },
    "*"
  );
};

const transactions = new Map<string, TransactionDetailsFragment>();

export const updateTransactionRows = async (
  changedTransactions: TransactionDetailsFragment[]
) => {
  changedTransactions.forEach((transaction) => {
    transactions.set(transaction.id, transaction);
  });
  const sortedTransactions = Array.from(transactions.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  window.postMessage(
    {
      type: "FROM_CONTENT_SCRIPT",
      id: "transactions_changed",
      transactions: sortedTransactions,
    },
    "*"
  );
  fakeBalanceChanges();
};

const fakeBalanceChanges = () => {
  if (!initialBalances) {
    return;
  }

  console.log("initialBalances", JSON.stringify(initialBalances));
  let viewerBalanceValue = initialBalances.viewerBalance.value;
  let creatorBalanceValue = initialBalances.creatorBalance.value;
  for (const t of Array.from(transactions.values())) {
    if (t.status === TransactionStatus.Success) {
      viewerBalanceValue -= t.amount.value;
      creatorBalanceValue += t.amount.value;
    }
  }
  console.log(
    "new values",
    JSON.stringify({ viewerBalanceValue, creatorBalanceValue })
  );
  renderBalances({
    viewerBalance: {
      ...initialBalances.viewerBalance,
      value: viewerBalanceValue,
    },
    creatorBalance: {
      ...initialBalances.creatorBalance,
      value: creatorBalanceValue,
    },
  });
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
