// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import {
  CurrencyAmount as GraphQLCurrencyAmountType,
  CurrencyUnit,
} from "@lightsparkdev/lightspark-sdk";
import { Icon } from "../icons/Icon";
import {
  CurrencyMap,
  formatCurrencyStr,
  isCurrencyMap,
  mapCurrencyAmount,
} from "../utils/currency";

type CurrencyAmountProps = {
  amount: CurrencyAmountType | CurrencyMap;
  displayUnit?: CurrencyUnit;
  shortNumber?: boolean;
  showUnits?: boolean;
  ml?: number;
};

const CurrencyAmount = ({
  amount,
  displayUnit = CurrencyUnit.SATOSHI,
  shortNumber,
  showUnits = false,
  ml = 0,
}: CurrencyAmountProps) => {
  const amountMap = isCurrencyMap(amount) ? amount : mapCurrencyAmount(amount);
  const value = amountMap[displayUnit] as number;
  let formattedNumber = amountMap.formatted[displayUnit];
  if (shortNumber) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit: displayUnit },
      1,
      true
    );
  }
  if (showUnits) {
    formattedNumber += ` ${shorttext(displayUnit, value)}`;
  }

  return (
    <StyledCurrencyAmount ml={ml}>
      <CurrencyIcon unit={displayUnit} />
      {formattedNumber}
    </StyledCurrencyAmount>
  );
};

export const CurrencyIcon = ({ unit }: { unit: CurrencyUnit }) => {
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return <Icon name="BitcoinB" width={8} verticalAlign={-2} mr={2} />;
    case CurrencyUnit.SATOSHI:
      return <Icon name="Satoshi" width={8} verticalAlign={-2} mr={2} />;
    default:
      return null;
  }
};

const shorttext = (unit: CurrencyUnit, value: number) => {
  const pl = value !== 1;
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return "BTC";
    case CurrencyUnit.MILLIBITCOIN:
      return "mBTC";
    case CurrencyUnit.MICROBITCOIN:
      return "μBTC";
    case CurrencyUnit.SATOSHI:
      return `sat${pl ? "s" : ""}`;
    case CurrencyUnit.MILLISATOSHI:
      return `msat${pl ? "s" : ""}`;
  }
  return unit;
};

const StyledCurrencyAmount = styled.span<{ ml: number }>`
  color: inherit !important;
  white-space: nowrap;
  font-feature-settings: "tnum" on, "lnum" on;
  margin-left: ${({ ml }) => ml}px;
`;

export class ConversionError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export type CurrencyAmountType = Omit<
  GraphQLCurrencyAmountType,
  | "__typename"
  | "original_value"
  | "original_unit"
  | "preferred_currency_value_rounded"
  | "preferred_currency_value_approx"
  | "preferred_currency_unit"
>;

export const valueAsSatoshis = (amount: CurrencyAmountType): number => {
  switch (amount.originalUnit) {
    case CurrencyUnit.BITCOIN:
      return amount.originalValue * 1e8;
    case CurrencyUnit.SATOSHI:
      return amount.originalValue;
    case CurrencyUnit.MILLISATOSHI:
      return amount.originalValue * 0.001;
  }
  throw new ConversionError(`Cannot convert from {amount.unit} to Satoshis`);
};

export default CurrencyAmount;
