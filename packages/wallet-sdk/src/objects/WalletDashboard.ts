import { Maybe } from "@lightsparkdev/core";
import Balances from "./Balances.js";
import WalletStatus from "./WalletStatus.js";
import WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";

type WalletDashboard = {
  id: string;
  status: WalletStatus;
  balances: Maybe<Balances>;
  recentTransactions: WalletToTransactionsConnection;
  paymentRequests: WalletToPaymentRequestsConnection;
};

export default WalletDashboard;
