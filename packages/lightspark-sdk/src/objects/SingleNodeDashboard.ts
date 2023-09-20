import type { Maybe } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import type LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import type NodeAddressType from "./NodeAddressType.js";
import type Transaction from "./Transaction.js";

type SingleNodeDashboard = {
  id: string;
  displayName: string;
  color: Maybe<string>;
  publicKey: Maybe<string>;
  status: Maybe<LightsparkNodeStatus>;
  addresses: {
    address: string;
    type: NodeAddressType;
  }[];
  totalBalance: Maybe<CurrencyAmount>;
  totalLocalBalance: Maybe<CurrencyAmount>;
  onlineLocalBalance: Maybe<CurrencyAmount>;
  remoteBalance: Maybe<CurrencyAmount>;
  blockchainBalance: {
    availableBalance: Maybe<CurrencyAmount>;
    totalBalance: Maybe<CurrencyAmount>;
    confirmedBalance: Maybe<CurrencyAmount>;
    unconfirmedBalance: Maybe<CurrencyAmount>;
  } | null;
  recentTransactions: Transaction[];
};

export default SingleNodeDashboard;
