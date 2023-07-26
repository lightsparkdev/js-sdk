import styled from "@emotion/styled";
import { Maybe } from "@lightsparkdev/core";
import { CurrencyAmount } from "@lightsparkdev/ui/components/CurrencyAmount";
import {
  CurrencyAmount as CurrencyAmountType,
  CurrencyUnit,
  Transaction,
  WalletDashboard,
} from "@lightsparkdev/wallet-sdk";
import { Button } from "src/components/Button";
import { Table, Td, Th, Tr } from "./Table";

const Dashboard = ({ data }: { data: WalletDashboard }) => {
  return (
    <Container>
      <Welcome>Welcome!</Welcome>
      <Subtitle>Your wallet's status is: {data.status}</Subtitle>
      <AmountBar>
        <AmountWithLabel
          label="Owned Balance"
          amount={data.balances?.ownedBalance}
        />
        <AmountWithLabel
          label="Sendable Balance"
          amount={data.balances?.availableToSendBalance}
        />
        <AmountWithLabel
          label="Withdrawable Balance"
          amount={data.balances?.availableToWithdrawBalance}
        />
      </AmountBar>
      <ActionsBar>
        <Button
          text="Send Payment"
          primary
          // mt={isSm ? 0 : 24}
          // loading={sendingPayment}
          // onClick={onSubmit}
        />
      </ActionsBar>
      <TransactionTable transactions={data.recentTransactions.entities} />
    </Container>
  );
};

const TransactionTable = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  return (
    <Table style={{ marginTop: "32px" }}>
      <thead>
        <Tr>
          <Th>Date</Th>
          <Th>Type</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
        </Tr>
      </thead>
      <tbody>
        {transactions?.map((tx) => {
          return (
            <Tr key={tx.id}>
              <Td>{new Date(tx.createdAt).toLocaleString()}</Td>
              <Td>{tx.typename}</Td>
              <Td>
                <CurrencyAmount amount={tx.amount} />
              </Td>
              <Td>{tx.status}</Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
`;

const Welcome = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: #666666;
  margin-bottom: 32px;
  margin-top: 8px;
`;

const AmountBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const ActionsBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const AmountWithLabel = ({
  label,
  amount,
}: {
  label: string;
  amount: Maybe<CurrencyAmountType>;
}) => {
  const amountOrZero = amount || {
    originalValue: 0,
    originalUnit: CurrencyUnit.SATOSHI,
    preferredCurrencyValueRounded: 0,
    preferredCurrencyValueApprox: 0,
    preferredCurrencyUnit: CurrencyUnit.USD,
  };
  return (
    <AmountWrapper>
      <AmountLabel>{label}</AmountLabel>
      <SatAmount>
        <CurrencyAmount amount={amountOrZero} />
      </SatAmount>
      <UsdAmount>
        Est.{" "}
        <CurrencyAmount amount={amountOrZero} displayUnit={CurrencyUnit.USD} />
      </UsdAmount>
    </AmountWrapper>
  );
};

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.08);
`;

const AmountLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const SatAmount = styled.span`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const UsdAmount = styled.span`
  font-size: 12px;
`;

export default Dashboard;
