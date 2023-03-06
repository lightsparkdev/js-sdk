import React from "react";
import styled from "@emotion/styled";
import {
  CurrencyUnit,
  Transaction,
} from "@lightsparkdev/js-sdk/objects";
import CurrencyAmountRaw from "./CurrencyAmountRaw";
import { LoadingSpinner } from "./Loading";

const StreamingTransactionChip = (props: {
  transactions: Transaction[];
  streamingDuration: number;
  isStreaming: boolean;
}) => {
  const filteredTransactions = props.transactions.filter(
    (t) => t.typename === "OutgoingPayment"
  );
  // TODO: Probably need a unit normalization here to ensure they're all sats.
  const totalTransactionAmount = filteredTransactions.reduce(
    (acc, t) => acc + t.amount.value,
    0
  );
  return (
    <Wrapper>
      <InnerColumn>
        <TopTextRow>Demo wallet</TopTextRow>
        <BottomTextRow>
          {props.isStreaming ? (
            <>
              <LoadingSpinner />
              <span style={{ marginInlineStart: "4px" }}>Streaming</span>
            </>
          ) : (
            `${filteredTransactions.length} transactions`
          )}
        </BottomTextRow>
      </InnerColumn>
      <InnerColumn style={{ alignItems: "flex-end" }}>
        <TopTextRow>
          <CurrencyAmountRaw
            value={-totalTransactionAmount}
            unit={CurrencyUnit.SATOSHI}
            shortNumber
            shortUnit
            symbol
          />
        </TopTextRow>
        <BottomTextRow>
          {secondsToDurationString(Math.round(props.streamingDuration))}
        </BottomTextRow>
      </InnerColumn>
    </Wrapper>
  );
};

const secondsToDurationString = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;
  const hoursString = hours > 0 ? `${hours}h ` : "";
  const minutesString = minutes > 0 ? `${minutes}m ` : "";
  const secondsString = secondsLeft > 0 ? `${secondsLeft}s` : "";
  return `${hoursString}${minutesString}${secondsString}`;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
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

const BottomTextRow = styled.div`
  color: #999999;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 16px;
  justify-content: center;
`;

export default StreamingTransactionChip;
