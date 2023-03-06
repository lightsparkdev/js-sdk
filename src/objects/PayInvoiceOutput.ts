// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type PayInvoiceOutput = {
  /** The payment that has been sent. **/
  paymentId: string;
};

export const PayInvoiceOutputFromJson = (obj: any): PayInvoiceOutput => {
  return {
    paymentId: obj["pay_invoice_output_payment"].id,
  } as PayInvoiceOutput;
};

export const FRAGMENT = `
fragment PayInvoiceOutputFragment on PayInvoiceOutput {
    __typename
    pay_invoice_output_payment: payment {
        id
    }
}`;

export default PayInvoiceOutput;
