import type { Maybe } from "@lightsparkdev/core";
import type Balances from "./Balances.js";
import type WalletStatus from "./WalletStatus.js";
import type WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import type WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";

type WalletDashboard = {
  id: string;
  status: WalletStatus;
  balances: Maybe<Balances>;
  recentTransactions: WalletToTransactionsConnection;
  paymentRequests: WalletToPaymentRequestsConnection;
};

export default WalletDashboard;
