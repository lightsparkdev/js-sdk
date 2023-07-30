// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import { currencyAmountFragment } from "@lightsparkdev/gql/fragments";
import {
  CurrencyUnit,
  type CurrencyAmount as GQLCurrencyAmountType,
} from "@lightsparkdev/gql/generated/graphql";
import { Icon } from "@lightsparkdev/ui/icons";
import {
  CurrencyAmountArg,
  CurrencyMap,
  formatCurrencyStr,
  isCurrencyMap,
  mapCurrencyAmount,
} from "@lightsparkdev/ui/utils/currency";
import { CurrencyUnit as SDKCurrencyUnitType } from "@lightsparkdev/wallet-sdk";

type CurrencyAmountProps = {
  amount: CurrencyAmountArg | CurrencyMap;
  displayUnit?: CurrencyUnit | SDKCurrencyUnitType;
  shortNumber?: boolean;
  showUnits?: boolean;
  ml?: number;
  includeEstimatedIndicator?: boolean;
  showSubSatDigits?: boolean;
};

function normalizeUnit(displayUnit: CurrencyUnit | SDKCurrencyUnitType) {
  switch (displayUnit) {
    case SDKCurrencyUnitType.MILLISATOSHI:
      return CurrencyUnit.Millisatoshi;
    case SDKCurrencyUnitType.SATOSHI:
      return CurrencyUnit.Satoshi;
    case SDKCurrencyUnitType.MILLIBITCOIN:
      return CurrencyUnit.Millibitcoin;
    case SDKCurrencyUnitType.BITCOIN:
      return CurrencyUnit.Bitcoin;
    case SDKCurrencyUnitType.MICROBITCOIN:
      return CurrencyUnit.Microbitcoin;
    case SDKCurrencyUnitType.USD:
      return CurrencyUnit.Usd;
    case SDKCurrencyUnitType.NANOBITCOIN:
      return CurrencyUnit.Nanobitcoin;
    default:
      return CurrencyUnit.Satoshi;
  }
}

export function CurrencyAmount({
  amount,
  displayUnit = CurrencyUnit.Satoshi,
  shortNumber = false,
  showUnits = false,
  includeEstimatedIndicator = false,
  /* Product has voted to hide msats from end users.
     showSubSatDigits should only be used in ops tools: */
  showSubSatDigits = false,
  ml = 0,
}: CurrencyAmountProps) {
  const unit = normalizeUnit(displayUnit);

  const amountMap = isCurrencyMap(amount) ? amount : mapCurrencyAmount(amount);
  const value = amountMap[unit] as number;
  const defaultFormattedNumber = amountMap.formatted[unit];

  /* There are just a few ways that CurrencyAmounts need to be formatted
     throughout the UI. In general the default should always be used: */
  let formattedNumber = defaultFormattedNumber;
  if (shortNumber) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit: unit },
      1,
      true
    );
  } else if (showSubSatDigits) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit: CurrencyUnit.Satoshi },
      3
    );
  }

  if (showUnits) {
    formattedNumber += ` ${shorttext(unit, value)}`;
  }

  return (
    <StyledCurrencyAmount ml={ml}>
      {includeEstimatedIndicator && "Est. "}
      <CurrencyIcon unit={unit} />
      {formattedNumber}
    </StyledCurrencyAmount>
  );
}

export const CurrencyIcon = ({ unit }: { unit: CurrencyUnit }) => {
  switch (unit) {
    case CurrencyUnit.Bitcoin:
      return <Icon name="BitcoinB" width={8} verticalAlign={-2} mr={2} />;
    case CurrencyUnit.Satoshi:
      return <Icon name="Satoshi" width={8} verticalAlign={-2} mr={2} />;
    default:
      return null;
  }
};

const shorttext = (unit: CurrencyUnit, value: number) => {
  const pl = value !== 1;
  switch (unit) {
    case CurrencyUnit.Bitcoin:
      return "BTC";
    case CurrencyUnit.Millibitcoin:
      return "mBTC";
    case CurrencyUnit.Microbitcoin:
      return "μBTC";
    case CurrencyUnit.Satoshi:
      return `sat${pl ? "s" : ""}`;
    case CurrencyUnit.Millisatoshi:
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

CurrencyAmount.fragments = {
  amount: currencyAmountFragment,
};

export type CurrencyAmountType = Omit<
  GQLCurrencyAmountType,
  | "__typename"
  | "original_value"
  | "original_unit"
  | "preferred_currency_value_rounded"
  | "preferred_currency_value_approx"
  | "preferred_currency_unit"
>;
