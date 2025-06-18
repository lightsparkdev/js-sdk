// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query, isObject } from "@lightsparkdev/core";
import IncentivesIneligibilityReason from "./IncentivesIneligibilityReason.js";
import IncentivesStatus from "./IncentivesStatus.js";
import { UmaCurrencyAmount } from "./UmaCurrencyAmount.js";

export enum UmaInvitationStatus {
  PENDING = "PENDING",
  CLAIMED = "CLAIMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

/** This is an object representing an UMA.ME invitation. **/
interface UmaInvitation {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The code that uniquely identifies this invitation. **/
  code: string;

  /** The URL where this invitation can be claimed. **/
  url: string;

  /** The UMA of the user who created the invitation. **/
  inviterUma: string;

  /** The current status of the incentives that may be tied to this invitation. **/
  incentivesStatus: IncentivesStatus;

  /** The typename of the object **/
  typename: string;

  /** The UMA of the user who claimed the invitation. **/
  inviteeUma?: string | undefined;

  /** The reason why the invitation is not eligible for incentives, if applicable. **/
  incentivesIneligibilityReason?: IncentivesIneligibilityReason | undefined;

  /** The status of the invitation. **/
  status: UmaInvitationStatus;

  /** Payment amount in lowest currency unit. Null if no payment attached. **/
  paymentAmount?: UmaCurrencyAmount | undefined;

  /** When the invitation was cancelled, if applicable. **/
  cancelledAt?: string | undefined;

  /** When the invitation expires. Null if no expiration set. **/
  expiresAt?: string | undefined;
}

export const UmaInvitationFromJson = (obj: any): UmaInvitation => {
  return {
    id: obj["uma_invitation_id"],
    createdAt: obj["uma_invitation_created_at"],
    updatedAt: obj["uma_invitation_updated_at"],
    code: obj["uma_invitation_code"],
    url: obj["uma_invitation_url"],
    inviterUma: obj["uma_invitation_inviter_uma"],
    incentivesStatus:
      IncentivesStatus[obj["uma_invitation_incentives_status"]] ??
      IncentivesStatus.FUTURE_VALUE,
    typename: "UmaInvitation",
    inviteeUma: obj["uma_invitation_invitee_uma"],
    incentivesIneligibilityReason: !!obj[
      "uma_invitation_incentives_ineligibility_reason"
    ]
      ? (obj[
          "uma_invitation_incentives_ineligibility_reason"
        ] as IncentivesIneligibilityReason) ??
        IncentivesIneligibilityReason.FUTURE_VALUE
      : null,
    status:
      (obj["uma_invitation_status"] as UmaInvitationStatus) ??
      (() => {
        throw new Error("Required field 'uma_invitation_status' is missing");
      })(),
    paymentAmount: obj["uma_invitation_payment_amount"]
      ? UmaCurrencyAmount.fromJson(obj["uma_invitation_payment_amount"])
      : undefined,
    cancelledAt: obj["uma_invitation_cancelled_at"],
    expiresAt: obj["uma_invitation_expires_at"],
  } as UmaInvitation;
};

export const UmaInvitationToJson = (obj: UmaInvitation): any => {
  return {
    __typename: "UmaInvitation",
    uma_invitation_id: obj.id,
    uma_invitation_created_at: obj.createdAt,
    uma_invitation_updated_at: obj.updatedAt,
    uma_invitation_code: obj.code,
    uma_invitation_url: obj.url,
    uma_invitation_inviter_uma: obj.inviterUma,
    uma_invitation_invitee_uma: obj.inviteeUma,
    uma_invitation_incentives_status: obj.incentivesStatus,
    uma_invitation_incentives_ineligibility_reason:
      obj.incentivesIneligibilityReason,
    uma_invitation_status: obj.status,
    uma_invitation_payment_amount: obj.paymentAmount
      ? obj.paymentAmount.toJson()
      : undefined,
    uma_invitation_cancelled_at: obj.cancelledAt,
    uma_invitation_expires_at: obj.expiresAt,
  };
};

export const FRAGMENT = `
fragment UmaInvitationFragment on UmaInvitation {
    __typename
    uma_invitation_id: id
    uma_invitation_created_at: created_at
    uma_invitation_updated_at: updated_at
    uma_invitation_code: code
    uma_invitation_url: url
    uma_invitation_inviter_uma: inviter_uma
    uma_invitation_invitee_uma: invitee_uma
    uma_invitation_incentives_status: incentives_status
    uma_invitation_incentives_ineligibility_reason: incentives_ineligibility_reason
    uma_invitation_status: status
    uma_invitation_payment_amount: payment_amount {
        value
        currency {
            code
            symbol
            decimals
            name
        }
    }
    uma_invitation_cancelled_at: cancelled_at
    uma_invitation_expires_at: expires_at
}`;

export const getUmaInvitationQuery = (id: string): Query<UmaInvitation> => {
  return {
    queryPayload: `
query GetUmaInvitation($id: ID!) {
    entity(id: $id) {
        ... on UmaInvitation {
            ...UmaInvitationFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: unknown) =>
      isObject(data) && "entity" in data && isObject(data.entity)
        ? UmaInvitationFromJson(data.entity)
        : null,
  };
};

export default UmaInvitation;
