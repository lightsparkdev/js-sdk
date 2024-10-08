// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import type {
  CurrencyAmountArg,
  CurrencyMap,
  CurrencyUnitType,
} from "@lightsparkdev/core";
import {
  CurrencyUnit,
  formatCurrencyStr,
  isCurrencyMap,
  mapCurrencyAmount,
} from "@lightsparkdev/core";
import type { ReactNode } from "react";
import { Icon } from "./Icon/Icon.js";
import { renderTypography } from "./typography/renderTypography.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

type CurrencyAmountProps = {
  amount: CurrencyAmountArg | CurrencyMap;
  displayUnit?: CurrencyUnitType;
  shortNumber?: boolean;
  showUnits?: boolean;
  ml?: number;
  id?: string;
  includeEstimatedIndicator?: boolean;
  fullPrecision?: boolean | undefined;
  typography?: PartialSimpleTypographyProps;
  unitsPerBtc?: number;
};

export function CurrencyAmount({
  amount,
  displayUnit = CurrencyUnit.SATOSHI,
  shortNumber = false,
  showUnits = false,
  includeEstimatedIndicator = false,
  fullPrecision = false,
  id,
  ml = 0,
  typography,
  unitsPerBtc,
}: CurrencyAmountProps) {
  const unit = displayUnit;

  const amountMap = isCurrencyMap(amount)
    ? amount
    : mapCurrencyAmount(amount, unitsPerBtc);

  const value = amountMap[unit];
  const defaultFormattedNumber = amountMap.formatted[unit];

  /* There are just a few ways that CurrencyAmounts need to be formatted
     throughout the UI. In general the default should always be used: */
  let formattedNumber = defaultFormattedNumber;
  if (shortNumber) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit },
      { precision: 1, compact: true },
    );
  } else if (fullPrecision) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit },
      { precision: "full" },
    );
  }

  if (showUnits) {
    formattedNumber += ` ${shorttext(unit, value)}`;
  }

  let content: string | ReactNode = formattedNumber;
  if (typography && typography.type) {
    content = renderTypography(typography.type, {
      size: typography.size,
      color: typography.color,
      children: formattedNumber,
    });
  }

  return (
    <StyledCurrencyAmount ml={ml} id={id}>
      {includeEstimatedIndicator && "Est. "}
      <CurrencyIcon unit={unit} />
      {content}
    </StyledCurrencyAmount>
  );
}

export const CurrencyIcon = ({ unit }: { unit: CurrencyUnitType }) => {
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return <Icon name="BitcoinB" width={8} verticalAlign={-2} mr={2} />;
    case CurrencyUnit.SATOSHI:
      return <Icon name="Satoshi" width={8} verticalAlign={-2} mr={2} />;
    default:
      return null;
  }
};

const shorttext = (unit: CurrencyUnitType, value: number) => {
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
    default:
      return unit;
  }
};

const StyledCurrencyAmount = styled.span<{ ml: number }>`
  color: inherit !important;
  white-space: nowrap;
  font-feature-settings:
    "tnum" on,
    "lnum" on;
  margin-left: ${({ ml }) => ml}px;
`;
