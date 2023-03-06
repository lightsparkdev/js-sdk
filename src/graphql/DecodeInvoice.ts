import { FRAGMENT as InvoiceDataFragment } from "../objects/InvoiceData.js";

export const DecodeInvoice = `
  query DecodeInvoice($encoded_payment_request: String!) {
    decoded_payment_request(encoded_payment_request: $encoded_payment_request) {
      __typename
      ... on InvoiceData {
        ...InvoiceDataFragment
      }
    }
  }

  ${InvoiceDataFragment}
`;
