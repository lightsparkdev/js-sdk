// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum HtlcAttemptFailureCode {
  INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS = "INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS",

  INCORRECT_PAYMENT_AMOUNT = "INCORRECT_PAYMENT_AMOUNT",

  FINAL_INCORRECT_CLTV_EXPIRY = "FINAL_INCORRECT_CLTV_EXPIRY",

  FINAL_INCORRECT_HTLC_AMOUNT = "FINAL_INCORRECT_HTLC_AMOUNT",

  FINAL_EXPIRY_TOO_SOON = "FINAL_EXPIRY_TOO_SOON",

  INVALID_REALM = "INVALID_REALM",

  EXPIRY_TOO_SOON = "EXPIRY_TOO_SOON",

  INVALID_ONION_VERSION = "INVALID_ONION_VERSION",

  INVALID_ONION_HMAC = "INVALID_ONION_HMAC",

  INVALID_ONION_KEY = "INVALID_ONION_KEY",

  AMOUNT_BELOW_MINIMUM = "AMOUNT_BELOW_MINIMUM",

  FEE_INSUFFICIENT = "FEE_INSUFFICIENT",

  INCORRECT_CLTV_EXPIRY = "INCORRECT_CLTV_EXPIRY",

  CHANNEL_DISABLED = "CHANNEL_DISABLED",

  TEMPORARY_CHANNEL_FAILURE = "TEMPORARY_CHANNEL_FAILURE",

  REQUIRED_NODE_FEATURE_MISSING = "REQUIRED_NODE_FEATURE_MISSING",

  REQUIRED_CHANNEL_FEATURE_MISSING = "REQUIRED_CHANNEL_FEATURE_MISSING",

  UNKNOWN_NEXT_PEER = "UNKNOWN_NEXT_PEER",

  TEMPORARY_NODE_FAILURE = "TEMPORARY_NODE_FAILURE",

  PERMANENT_NODE_FAILURE = "PERMANENT_NODE_FAILURE",

  PERMANENT_CHANNEL_FAILURE = "PERMANENT_CHANNEL_FAILURE",

  EXPIRY_TOO_FAR = "EXPIRY_TOO_FAR",

  MPP_TIMEOUT = "MPP_TIMEOUT",

  INVALID_ONION_PAYLOAD = "INVALID_ONION_PAYLOAD",

  INTERNAL_FAILURE = "INTERNAL_FAILURE",

  UNKNOWN_FAILURE = "UNKNOWN_FAILURE",

  UNREADABLE_FAILURE = "UNREADABLE_FAILURE",
}

export default HtlcAttemptFailureCode;
