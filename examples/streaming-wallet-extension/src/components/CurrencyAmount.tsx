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
      value={amount.preferredCurrencyValueApprox}
      unit={amount.preferredCurrencyUnit}
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

// TODO: consider moving this to fetch the actual exchange rate.
const SATS_TO_USD = .0268;
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
  [
    CurrencyUnit.USD,
    new Map([
      [CurrencyUnit.USD, 1],
      [CurrencyUnit.SATOSHI, SATS_TO_USD],
      [CurrencyUnit.BITCOIN, SATS_TO_USD * 1e8],
      [CurrencyUnit.MILLISATOSHI, SATS_TO_USD / 1000],
    ]),
  ],
]);

const convert = (
  amount: CurrencyAmountType,
  unit: Maybe<CurrencyUnit>
): CurrencyAmountType => {
  if (unit === null || unit === undefined || unit === amount.originalUnit)
    return amount;
  const multiplier = btc_conversions.get(amount.originalUnit)?.get(unit);
  if (!multiplier) {
    throw new ConversionError(`Unable to convert from {amount.unit} to {unit}`);
  }

  return {
    unit: amount.originalUnit,
    value: amount.originalValue,
    originalUnit: amount.originalUnit,
    originalValue: amount.originalValue,
    preferredCurrencyUnit: unit,
    preferredCurrencyValueApprox: amount.originalValue * multiplier,
    preferredCurrencyValueRounded: amount.originalValue * multiplier
  };
};

export class ConversionError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export default CurrencyAmount;
