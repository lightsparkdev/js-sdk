import React from "react";
import styled from "@emotion/styled";
import { TransactionDetailsFragment } from "@lightspark/js-sdk/generated/graphql";
import { Maybe } from "../common/types";
import CurrencyAmountRaw from "./CurrencyAmountRaw";


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

const getTransactionOrigin = (
  transaction: TransactionDetailsFragment
): Maybe<string> => {
  switch (transaction.__typename) {
    case "Withdrawal":
      return transaction.withdraw_origin.display_name;
    case "ChannelOpeningTransaction":
      return transaction.channel?.local_node?.display_name;
    case "ChannelClosingTransaction":
      return transaction.channel?.remote_node?.display_name;
    case "OutgoingPayment":
      return transaction.outgoing_payment_origin.display_name;
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

const TransactionRow = (props: {transaction: TransactionDetailsFragment}) => {
    return (
        <TransactionWrapper>
            <TransactionTypeIcon type={props.transaction.__typename} />
            <div style={{display: "flex", flexDirection: "column", marginInlineStart: "8px", flex: "1"}}>
                <div style={{fontSize: "14px", fontWeight: 500}}>{getTransactionType(props.transaction.__typename)}</div>
                <div style={{fontSize: "8px", color: "#8C8C8C"}}>
                    {getTransactionOrigin(props.transaction)} → {getTransactionDestination(props.transaction)}
                </div>
            </div>
            <div style={{fontSize: "16px", fontWeight: "bold"}}>
                <CurrencyAmountRaw value={props.transaction.amount.value} unit={props.transaction.amount.unit} shortNumber shortUnit />
            </div>
        </TransactionWrapper>
    );
}

type TypeProps = {
    type: TransactionTypename;
}

const TransactionWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #E8E8E8;
`;

const TransactionTypeIcon = styled.div<TypeProps>`
    background-color: ${(props) => {
        switch (props.type) {
            case "Deposit":
                return "#00C48C";
            case "Withdrawal":
                return "#FF4D4F";
            case "ChannelOpeningTransaction":
                return "#1890FF";
            case "ChannelClosingTransaction":
                return "#FF4D4F";
            case "RoutingTransaction":
                return "#1890FF";
            case "OutgoingPayment":
                return "#00C48C";
            case "IncomingPayment":
                return "#1890FF";
            default:
                return "#000000";
        }
    }};
    border-radius: 50%;
    width: 24px;
    height: 24px;
`;


export default TransactionRow;