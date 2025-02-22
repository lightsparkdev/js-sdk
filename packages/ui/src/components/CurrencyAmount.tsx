// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import type {
  AppendUnitsOptions,
  CurrencyAmountArg,
  CurrencyMap,
  CurrencyUnitType,
  UmaCurrencyAmount,
} from "@lightsparkdev/core";
import {
  CurrencyUnit,
  formatCurrencyStr,
  getCurrencyAmount,
  isCurrencyMap,
  isUmaCurrencyAmount,
  mapCurrencyAmount,
} from "@lightsparkdev/core";
import type { ReactNode } from "react";
import { Icon } from "./Icon/Icon.js";
import { renderTypography } from "./typography/renderTypography.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

type CurrencyAmountProps = {
  amount: CurrencyAmountArg | CurrencyMap | UmaCurrencyAmount;
  displayUnit?: CurrencyUnitType;
  shortNumber?: boolean;
  showUnits?: boolean | AppendUnitsOptions | undefined;
  ml?: number;
  id?: string;
  includeEstimatedIndicator?: boolean;
  fullPrecision?: boolean | undefined;
  typography?: PartialSimpleTypographyProps;
  unitsPerBtc?: number;
  showCurrencyIcon?: boolean;
};

export function CurrencyAmount({
  amount,
  displayUnit: displayUnitProp,
  shortNumber = false,
  showUnits = false,
  includeEstimatedIndicator = false,
  fullPrecision = false,
  id,
  ml = 0,
  typography,
  unitsPerBtc,
  showCurrencyIcon = true,
}: CurrencyAmountProps) {
  let value: number;
  let defaultFormattedNumber: string;
  let displayUnitStr: string;
  let currencyAmountForFormatting: CurrencyAmountArg | UmaCurrencyAmount;
  if (isUmaCurrencyAmount(amount)) {
    value = amount.value;
    defaultFormattedNumber = formatCurrencyStr(amount);
    displayUnitStr =
      amount.currency.code === "SAT"
        ? CurrencyUnit.SATOSHI
        : amount.currency.code;
    currencyAmountForFormatting = amount;
  } else {
    let amountMap: CurrencyMap;
    let displayUnit: CurrencyUnitType;
    if (isCurrencyMap(amount)) {
      displayUnit = displayUnitProp || CurrencyUnit.SATOSHI;
      amountMap = amount;
    } else {
      const resolvedCurrencyAmount = getCurrencyAmount(amount);
      /* default to the currency amount unit if defined and displayUnit is not provided: */
      displayUnit = displayUnitProp || resolvedCurrencyAmount.unit;
      amountMap = mapCurrencyAmount(amount, unitsPerBtc);
    }

    value = amountMap[displayUnit];
    defaultFormattedNumber = amountMap.formatted[displayUnit];
    displayUnitStr = displayUnit;
    currencyAmountForFormatting = { value: Number(value), unit: displayUnit };
  }

  const appendUnits =
    showUnits === false
      ? undefined
      : showUnits === true
      ? ({
          plural: false,
          lowercase: false,
          showForCurrentLocaleUnit: false,
        } as const)
      : showUnits;

  /* There are just a few ways that CurrencyAmounts need to be formatted
     throughout the UI. In general the default should always be used: */
  let formattedNumber = defaultFormattedNumber;
  if (shortNumber) {
    formattedNumber = formatCurrencyStr(currencyAmountForFormatting, {
      precision: 1,
      compact: true,
      appendUnits,
    });
  } else if (fullPrecision) {
    formattedNumber = formatCurrencyStr(currencyAmountForFormatting, {
      precision: "full",
      appendUnits,
    });
  } else if (appendUnits) {
    formattedNumber = formatCurrencyStr(currencyAmountForFormatting, {
      appendUnits,
    });
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
      {showCurrencyIcon ? (
        <CurrencyIcon unit={displayUnitStr as CurrencyUnitType} />
      ) : null}
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

const StyledCurrencyAmount = styled.span<{ ml: number }>`
  color: inherit !important;
  white-space: nowrap;
  font-feature-settings:
    "tnum" on,
    "lnum" on;
  margin-left: ${({ ml }) => ml}px;
`;
