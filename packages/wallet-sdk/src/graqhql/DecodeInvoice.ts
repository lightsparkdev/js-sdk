// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceDataFragment } from "../objects/InvoiceData.js";

const DecodeInvoiceQuery = `
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

export default DecodeInvoiceQuery;
