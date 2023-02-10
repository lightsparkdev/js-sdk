// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import React from "react";
import { gql } from "@apollo/client";
import CurrencyAmountRaw from "./CurrencyAmountRaw";
import {
  CurrencyAmount as CurrencyAmountType,
  CurrencyUnit,
} from "@lightspark/js-sdk/generated/graphql";
import { Maybe, OmitTypename } from "../common/types";

type Props = {
  amount?: OmitTypename<CurrencyAmountType> | null;
  displayUnit?: CurrencyUnit;
  shortNumber?: boolean;
  shortUnit?: boolean;
  symbol?: boolean;
  useLocaleString?: boolean;
  maximumSignificantDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  dash?: boolean;
};

const CurrencyAmount = (props: Props) => {
  if (!props.amount) {
    return props.dash ? <>-</> : null;
  }
  const amount = convert(props.amount, props.displayUnit);
  return (
    <CurrencyAmountRaw
      value={amount.value}
      unit={amount.unit}
      shortNumber={props.shortNumber}
      shortUnit={props.shortUnit}
      symbol={props.symbol}
      useLocaleString={props.useLocaleString}
      maximumSignificantDigits={props.maximumSignificantDigits}
      maximumFractionDigits={props.maximumFractionDigits}
      minimumFractionDigits={props.minimumFractionDigits}
    />
  );
};

const btc_conversions: Map<CurrencyUnit, Map<CurrencyUnit, number>> = new Map([
  [
    CurrencyUnit.Bitcoin,
    new Map([
      [CurrencyUnit.Bitcoin, 1],
      [CurrencyUnit.Satoshi, 1e8],
      [CurrencyUnit.Millisatoshi, 1e11],
    ]),
  ],
  [
    CurrencyUnit.Satoshi,
    new Map([
      [CurrencyUnit.Bitcoin, 1e-8],
      [CurrencyUnit.Satoshi, 1],
      [CurrencyUnit.Millisatoshi, 1000],
    ]),
  ],
  [
    CurrencyUnit.Millisatoshi,
    new Map([
      [CurrencyUnit.Bitcoin, 1e-11],
      [CurrencyUnit.Satoshi, 0.001],
      [CurrencyUnit.Millisatoshi, 1],
    ]),
  ],
]);

const convert = (
  amount: OmitTypename<CurrencyAmountType>,
  unit: Maybe<CurrencyUnit>
): OmitTypename<CurrencyAmountType> => {
  if (unit === null || unit === undefined || unit === amount.unit)
    return amount;
  const multiplier = btc_conversions.get(amount.unit)?.get(unit);
  if (!multiplier) {
    throw new ConversionError(`Unable to convert from {amount.unit} to {unit}`);
  }

  return {
    unit: unit,
    value: amount.value * multiplier,
  };
};

CurrencyAmount.fragments = {
  amount: gql`
    fragment CurrencyAmount_amount on CurrencyAmount {
      value
      unit
    }
  `,
};

export class ConversionError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export const asSatoshis = (
  amount?: Maybe<OmitTypename<CurrencyAmountType>>
): Maybe<OmitTypename<CurrencyAmountType>> => {
  if (amount === undefined || amount === null) {
    return null;
  }
  return {
    value: valueAsSatoshis(amount),
    unit: CurrencyUnit.Satoshi,
  };
};

export const valueAsSatoshis = (
  amount: OmitTypename<CurrencyAmountType>
): number => {
  switch (amount.unit) {
    case CurrencyUnit.Bitcoin:
      return amount.value * 1e8;
    case CurrencyUnit.Satoshi:
      return amount.value;
    case CurrencyUnit.Millisatoshi:
      return amount.value * 0.001;
  }
  throw new ConversionError(`Cannot convert from {amount.unit} to Satoshis`);
};

export default CurrencyAmount;
