// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import {
  CurrencyAmount as CurrencyAmountType,
  CurrencyUnit,
} from "@lightsparkdev/js-sdk/objects";
import { Maybe } from "../common/types";
import CurrencyAmountRaw from "./CurrencyAmountRaw";

type Props = {
  amount?: CurrencyAmountType | null;
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
    CurrencyUnit.BITCOIN,
    new Map([
      [CurrencyUnit.BITCOIN, 1],
      [CurrencyUnit.SATOSHI, 1e8],
      [CurrencyUnit.MILLISATOSHI, 1e11],
    ]),
  ],
  [
    CurrencyUnit.SATOSHI,
    new Map([
      [CurrencyUnit.BITCOIN, 1e-8],
      [CurrencyUnit.SATOSHI, 1],
      [CurrencyUnit.MILLISATOSHI, 1000],
    ]),
  ],
  [
    CurrencyUnit.MILLISATOSHI,
    new Map([
      [CurrencyUnit.BITCOIN, 1e-11],
      [CurrencyUnit.SATOSHI, 0.001],
      [CurrencyUnit.MILLISATOSHI, 1],
    ]),
  ],
]);

const convert = (
  amount: CurrencyAmountType,
  unit: Maybe<CurrencyUnit>
): CurrencyAmountType => {
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

export class ConversionError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export const asSatoshis = (
  amount?: Maybe<CurrencyAmountType>
): Maybe<CurrencyAmountType> => {
  if (amount === undefined || amount === null) {
    return null;
  }
  return {
    value: valueAsSatoshis(amount),
    unit: CurrencyUnit.SATOSHI,
  };
};

export const valueAsSatoshis = (amount: CurrencyAmountType): number => {
  switch (amount.unit) {
    case CurrencyUnit.BITCOIN:
      return amount.value * 1e8;
    case CurrencyUnit.SATOSHI:
      return amount.value;
    case CurrencyUnit.MILLISATOSHI:
      return amount.value * 0.001;
  }
  throw new ConversionError(`Cannot convert from {amount.unit} to Satoshis`);
};

export default CurrencyAmount;
