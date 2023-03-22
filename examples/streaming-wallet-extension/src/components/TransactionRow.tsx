import styled from "@emotion/styled";
import {
  ChannelClosingTransaction,
  ChannelOpeningTransaction,
  IncomingPayment,
  OutgoingPayment,
  RoutingTransaction,
  Transaction,
  Withdrawal,
} from "@lightsparkdev/js-sdk/objects";
import { Maybe } from "../common/types";
import CurrencyAmount from "./CurrencyAmount";

export const getTransactionType = (typename: string): string => {
  switch (typename) {
    case "Deposit":
      return "L1 Deposit";
    case "Withdrawal":
      return "L1 Withdraw";
    case "ChannelOpeningTransaction":
      return "Channel Open";
    case "ChannelClosingTransaction":
      return "Channel Close";
    case "RoutingTransaction":
      return "Route";
    case "OutgoingPayment":
      return "Payment";
    case "IncomingPayment":
      return "Payment Request";
    default:
      return "";
  }
};

const getTransactionOtherNode = (transaction: Transaction): Maybe<string> => {
  switch (transaction.typename) {
    case "Withdrawal":
      return (transaction as Withdrawal).originId;
    case "ChannelOpeningTransaction":
      return (transaction as ChannelOpeningTransaction).channelId;
    case "ChannelClosingTransaction":
      return (transaction as ChannelClosingTransaction).channelId;
    case "OutgoingPayment":
      return (transaction as OutgoingPayment).destinationId;
    case "IncomingPayment":
      return (transaction as IncomingPayment).originId;
    case "RoutingTransaction":
      return (transaction as RoutingTransaction).incomingChannelId;
    default:
      return undefined;
  }
};

const TransactionRow = (props: { transaction: Transaction }) => {
  return (
    <TransactionWrapper>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginInlineStart: "8px",
          flex: "1",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 500 }}>
          {getTransactionOtherNode(props.transaction)}
        </div>
        <div style={{ fontSize: "10px", color: "#8C8C8C" }}>
          {getTransactionType(props.transaction.typename)}
        </div>
      </div>
      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#17C27C" }}>
        <CurrencyAmount
          amount={props.transaction.amount}
          displayUnit={props.transaction.amount.preferredCurrencyUnit}
          shortNumber
          shortUnit
          symbol
        />
      </div>
    </TransactionWrapper>
  );
};

const TransactionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
`;

export default TransactionRow;
