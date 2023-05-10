import { Maybe } from "@lightsparkdev/core";
import CurrencyAmount from "./CurrencyAmount.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import NodeAddressType from "./NodeAddressType.js";
import Transaction from "./Transaction.js";

type SingleNodeDashboard = {
  id: string;
  displayName: string;
  purpose: Maybe<LightsparkNodePurpose>;
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
