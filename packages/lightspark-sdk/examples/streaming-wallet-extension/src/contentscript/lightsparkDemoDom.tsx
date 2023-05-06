import {
  CurrencyAmount,
  Transaction,
  TransactionStatus,
} from "@lightsparkdev/lightspark-sdk";

type Balances = {
  viewerBalance: CurrencyAmount;
  creatorBalance: CurrencyAmount;
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

const transactions = new Map<string, Transaction>();

export const updateTransactionRows = async (
  changedTransactions: Transaction[]
) => {
  changedTransactions.forEach((transaction) => {
    transactions.set(transaction.id, transaction);
  });
  const sortedTransactions = Array.from(transactions.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
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
  let viewerBalance = initialBalances.viewerBalance;
  let creatorBalance = initialBalances.creatorBalance;
  for (const t of Array.from(transactions.values())) {
    if (t.status !== TransactionStatus.SUCCESS) {
      continue;
    }

    if (
      t.amount.preferredCurrencyUnit !== viewerBalance.preferredCurrencyUnit ||
      t.amount.originalUnit !== viewerBalance.originalUnit
    ) {
      console.warn("Transaction amount units do not match wallet balance");
      continue;
    }

    viewerBalance = addCurrencyAmounts(viewerBalance, negativeAmount(t.amount));
    creatorBalance = addCurrencyAmounts(creatorBalance, t.amount);
  }
  console.log("new values", JSON.stringify({ viewerBalance, creatorBalance }));
  renderBalances({ viewerBalance, creatorBalance });
};

const addCurrencyAmounts = (
  amount1: CurrencyAmount,
  amount2: CurrencyAmount
) => {
  return {
    ...amount1,
    originalValue: amount1.originalValue + amount2.originalValue,
    preferredCurrencyValueApprox:
      amount1.preferredCurrencyValueApprox +
      amount2.preferredCurrencyValueApprox,
    preferredCurrencyValueRounded:
      amount1.preferredCurrencyValueRounded +
      amount2.preferredCurrencyValueRounded,
  };
};

const negativeAmount = (amount: CurrencyAmount) => {
  return {
    ...amount,
    originalValue: -amount.originalValue,
    preferredCurrencyValueApprox: -amount.preferredCurrencyValueApprox,
    preferredCurrencyValueRounded: -amount.preferredCurrencyValueRounded,
  };
};

const getWalletBalances = () => {
  return chrome.runtime.sendMessage({
    id: "get_streaming_wallet_balances",
  }) as Promise<{ balances: any }>;
};
