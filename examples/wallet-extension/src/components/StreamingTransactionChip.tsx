import React from "react";
import styled from "@emotion/styled";
import {
  CurrencyUnit,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import CurrencyAmountRaw from "./CurrencyAmountRaw";

const StreamingTransactionChip = (props: {
  transactions: TransactionDetailsFragment[];
  isStreaming: boolean;
}) => {
  return (
    <Wrapper>
      <InnerColumn>
        <TopTextRow>Demo wallet</TopTextRow>
        <BottomTextRow>
          {props.isStreaming
            ? `Streaming`
            : `${props.transactions.length} transactions`}
        </BottomTextRow>
      </InnerColumn>
      <InnerColumn style={{ alignItems: "flex-end" }}>
        <TopTextRow>
          <CurrencyAmountRaw
            value={-10}
            unit={CurrencyUnit.Satoshi}
            shortNumber
            shortUnit
            symbol
          />
        </TopTextRow>
        <BottomTextRow>14s</BottomTextRow>
      </InnerColumn>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 24px;
  margin-top: 16px;
`;

const InnerColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopTextRow = styled.span`
  color: #white;
  font-size: 10px;
  font-weight: 700;
`;

const BottomTextRow = styled.span`
  color: #999999;
  font-size: 10px;
  font-weight: 500;
`;

export default StreamingTransactionChip;
