import React from "react";
import styled from "@emotion/styled";
import {
  CurrencyUnit,
  TransactionDetailsFragment,
  TransactionStatus,
} from "@lightspark/js-sdk/generated/graphql";
import CurrencyAmount from "./CurrencyAmount";
import { getFormattedDateTimeOrDefault } from "../common/datetimes";

const TransactionLogRow = (props: {
  transaction: TransactionDetailsFragment;
}) => {
  const colorForStatus = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Success:
        return "#T8BFFF";
      case TransactionStatus.Failed:
        return "red";
      default:
        return "#999999";
    }
  };
  return (
    <TransactionWrapper data-transaction-id={props.transaction.id}>
      <td>
        {getFormattedDateTimeOrDefault(
          props.transaction.created_at,
          "MM/DD, HH:mm:ss"
        )}
      </td>
      <td>{shorten(props.transaction.id)}</td>
      <td style={{ color: "white" }}>
        <CurrencyAmount
          amount={props.transaction.amount}
          displayUnit={CurrencyUnit.Satoshi}
          shortNumber
          shortUnit
          symbol
        />
      </td>
      <td style={{ color: "white" }}>Streaming</td>
      <td>{shorten(props.transaction.transaction_hash || '')}</td>
      <td style={{ color: colorForStatus(props.transaction.status) }}>
        {props.transaction.status}
      </td>
    </TransactionWrapper>
  );
};

const shorten = (str: string) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

const TransactionWrapper = styled.tr`
  font-size: 10px;
  font-weight: 500;
  color: #999999;
  cell-padding: 8px;
  cell-border: none;
  cell-spacing: 0;
`;

export default TransactionLogRow;
