// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export class UmaCurrencyAmount {
  value: number;
  currency: {
    code: string;
    symbol: string;
    decimals: number;
    name: string;
  };

  constructor(
    value: number,
    currency: { code: string; symbol: string; decimals: number; name: string },
  ) {
    this.value = value;
    this.currency = currency;
  }

  static fromJson(obj: any): UmaCurrencyAmount {
    if (!obj || !obj.currency) {
      throw new Error("Invalid currency amount data");
    }

    return new UmaCurrencyAmount(obj.value, {
      code: obj.currency.code,
      symbol: obj.currency.symbol,
      decimals: obj.currency.decimals,
      name: obj.currency.name,
    });
  }

  toJson(): any {
    return {
      value: this.value,
      currency: {
        code: this.currency.code,
        symbol: this.currency.symbol,
        decimals: this.currency.decimals,
        name: this.currency.name,
      },
    };
  }
}
