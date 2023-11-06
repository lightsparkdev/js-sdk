// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayInvoiceOutput {
  /** The payment that has been sent. **/
  paymentId: string;
}

export const PayInvoiceOutputFromJson = (obj: any): PayInvoiceOutput => {
  return {
    paymentId: obj["pay_invoice_output_payment"].id,
  } as PayInvoiceOutput;
};
export const PayInvoiceOutputToJson = (obj: PayInvoiceOutput): any => {
  return {
    pay_invoice_output_payment: { id: obj.paymentId },
  };
};

export const FRAGMENT = `
fragment PayInvoiceOutputFragment on PayInvoiceOutput {
    __typename
    pay_invoice_output_payment: payment {
        id
    }
}`;

export default PayInvoiceOutput;
