import React from "react";
import styled from "@emotion/styled";
import { CurrencyUnit, TransactionDetailsFragment } from "@lightspark/js-sdk/generated/graphql";
import { Maybe } from "../common/types";
import CurrencyAmount from "./CurrencyAmount";

type TransactionTypename =
  | "ChannelClosingTransaction"
  | "ChannelOpeningTransaction"
  | "Deposit"
  | "RoutingTransaction"
  | "OutgoingPayment"
  | "IncomingPayment"
  | "Withdrawal"
  | undefined;

export const getTransactionType = (typename: TransactionTypename): string => {
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
    case undefined:
      return "";
  }
};

const getTransactionOtherNode = (
  transaction: TransactionDetailsFragment
): Maybe<string> => {
  switch (transaction.__typename) {
    case "Withdrawal":
      return transaction.withdraw_origin.display_name;
    case "ChannelOpeningTransaction":
      return transaction.channel?.remote_node?.display_name;
    case "ChannelClosingTransaction":
      return transaction.channel?.remote_node?.display_name;
    case "OutgoingPayment":
      return transaction.outgoing_payment_destination?.display_name;
    case "IncomingPayment":
      return transaction.incoming_payment_origin?.display_name;
    case "RoutingTransaction":
      return transaction.incoming_channel?.remote_node?.display_name;
    default:
      return undefined;
  }
};

const getTransactionDestination = (
  transaction: TransactionDetailsFragment
): Maybe<string> => {
  switch (transaction.__typename) {
    case "Deposit":
      return transaction.deposit_destination.display_name;
    case "ChannelOpeningTransaction":
      return transaction.channel?.remote_node?.display_name;
    case "ChannelClosingTransaction":
      return transaction.channel?.local_node?.display_name;
    case "OutgoingPayment":
      return transaction.outgoing_payment_destination?.display_name;
    case "IncomingPayment":
      return transaction.incoming_payment_destination.display_name;
    case "RoutingTransaction":
      return transaction.outgoing_channel?.remote_node?.display_name;
    default:
      return undefined;
  }
};

const TransactionRow = (props: { transaction: TransactionDetailsFragment }) => {
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
          {getTransactionType(props.transaction.__typename)}
        </div>
      </div>
      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#17C27C" }}>
        <CurrencyAmount
          amount={props.transaction.amount}
          displayUnit={CurrencyUnit.Satoshi}
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
