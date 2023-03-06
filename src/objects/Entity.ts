// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/** This interface is used by all the entities in the Lightspark systems. It defines a few core fields that are available everywhere. Any object that implements this interface can be queried using the `entity` query and its ID. **/
type Entity = {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The typename of the object **/
  typename: string;
};

export const FRAGMENT = `
fragment EntityFragment on Entity {
    __typename
    ... on OutgoingPayment {
        __typename
        outgoing_payment_id: id
        outgoing_payment_created_at: created_at
        outgoing_payment_updated_at: updated_at
        outgoing_payment_status: status
        outgoing_payment_resolved_at: resolved_at
        outgoing_payment_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        outgoing_payment_transaction_hash: transaction_hash
        outgoing_payment_origin: origin {
            id
        }
        outgoing_payment_destination: destination {
            id
        }
        outgoing_payment_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        outgoing_payment_payment_request_data: payment_request_data {
            __typename
            ... on InvoiceData {
                __typename
                invoice_data_encoded_payment_request: encoded_payment_request
                invoice_data_bitcoin_network: bitcoin_network
                invoice_data_payment_hash: payment_hash
                invoice_data_amount: amount {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                invoice_data_created_at: created_at
                invoice_data_expires_at: expires_at
                invoice_data_destination: destination {
                    __typename
                    ... on LightsparkNode {
                        __typename
                        lightspark_node_id: id
                        lightspark_node_created_at: created_at
                        lightspark_node_updated_at: updated_at
                        lightspark_node_alias: alias
                        lightspark_node_bitcoin_network: bitcoin_network
                        lightspark_node_color: color
                        lightspark_node_conductivity: conductivity
                        lightspark_node_display_name: display_name
                        lightspark_node_public_key: public_key
                        lightspark_node_account: account {
                            id
                        }
                        lightspark_node_blockchain_balance: blockchain_balance {
                            __typename
                            blockchain_balance_total_balance: total_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_confirmed_balance: confirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_locked_balance: locked_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_required_reserve: required_reserve {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_available_balance: available_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                        }
                        lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encryption_public_key: encryption_public_key {
                            __typename
                            key_type: type
                            key_public_key: public_key
                        }
                        lightspark_node_grpc_hostname: grpc_hostname
                        lightspark_node_local_balance: local_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_name: name
                        lightspark_node_purpose: purpose
                        lightspark_node_remote_balance: remote_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_rest_url: rest_url
                        lightspark_node_status: status
                        lightspark_node_upgrade_available: upgrade_available
                        lightspark_node_has_channel_funding_op: has_channel_funding_op
                    }
                    ... on GraphNode {
                        __typename
                        graph_node_id: id
                        graph_node_created_at: created_at
                        graph_node_updated_at: updated_at
                        graph_node_alias: alias
                        graph_node_bitcoin_network: bitcoin_network
                        graph_node_color: color
                        graph_node_conductivity: conductivity
                        graph_node_display_name: display_name
                        graph_node_public_key: public_key
                    }
                }
                invoice_data_memo: memo
            }
        }
        outgoing_payment_failure_reason: failure_reason
        outgoing_payment_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
    }
    ... on LightsparkNode {
        __typename
        lightspark_node_id: id
        lightspark_node_created_at: created_at
        lightspark_node_updated_at: updated_at
        lightspark_node_alias: alias
        lightspark_node_bitcoin_network: bitcoin_network
        lightspark_node_color: color
        lightspark_node_conductivity: conductivity
        lightspark_node_display_name: display_name
        lightspark_node_public_key: public_key
        lightspark_node_account: account {
            id
        }
        lightspark_node_blockchain_balance: blockchain_balance {
            __typename
            blockchain_balance_total_balance: total_balance {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            blockchain_balance_confirmed_balance: confirmed_balance {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            blockchain_balance_locked_balance: locked_balance {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            blockchain_balance_required_reserve: required_reserve {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            blockchain_balance_available_balance: available_balance {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
        }
        lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
            __typename
            secret_encrypted_value: encrypted_value
            secret_cipher: cipher
        }
        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
            __typename
            secret_encrypted_value: encrypted_value
            secret_cipher: cipher
        }
        lightspark_node_encryption_public_key: encryption_public_key {
            __typename
            key_type: type
            key_public_key: public_key
        }
        lightspark_node_grpc_hostname: grpc_hostname
        lightspark_node_local_balance: local_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        lightspark_node_name: name
        lightspark_node_purpose: purpose
        lightspark_node_remote_balance: remote_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        lightspark_node_rest_url: rest_url
        lightspark_node_status: status
        lightspark_node_upgrade_available: upgrade_available
        lightspark_node_has_channel_funding_op: has_channel_funding_op
    }
    ... on Account {
        __typename
        account_id: id
        account_created_at: created_at
        account_updated_at: updated_at
        account_name: name
        account_webhooks_settings: webhooks_settings {
            __typename
            webhooks_settings_url: url
            webhooks_settings_secret: secret
            webhooks_settings_events: events
            webhooks_settings_url_testing: url_testing
        }
    }
    ... on Channel {
        __typename
        channel_id: id
        channel_created_at: created_at
        channel_updated_at: updated_at
        channel_channel_point: channel_point
        channel_funding_transaction: funding_transaction {
            id
        }
        channel_capacity: capacity {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_local_balance: local_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_local_unsettled_balance: local_unsettled_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_remote_balance: remote_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_remote_unsettled_balance: remote_unsettled_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_unsettled_balance: unsettled_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_total_balance: total_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_status: status
        channel_estimated_force_closure_wait_minutes: estimated_force_closure_wait_minutes
        channel_fees: fees {
            __typename
            channel_fees_base_fee: base_fee {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            channel_fees_fee_rate_per_mil: fee_rate_per_mil
        }
        channel_remote_node: remote_node {
            id
        }
        channel_local_node: local_node {
            id
        }
        channel_short_channel_id: short_channel_id
    }
    ... on OutgoingPaymentAttempt {
        __typename
        outgoing_payment_attempt_id: id
        outgoing_payment_attempt_created_at: created_at
        outgoing_payment_attempt_updated_at: updated_at
        outgoing_payment_attempt_status: status
        outgoing_payment_attempt_failure_code: failure_code
        outgoing_payment_attempt_failure_source_index: failure_source_index
        outgoing_payment_attempt_resolved_at: resolved_at
        outgoing_payment_attempt_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        outgoing_payment_attempt_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        outgoing_payment_attempt_outgoing_payment: outgoing_payment {
            id
        }
    }
    ... on Hop {
        __typename
        hop_id: id
        hop_created_at: created_at
        hop_updated_at: updated_at
        hop_destination: destination {
            id
        }
        hop_index: index
        hop_short_channel_id: short_channel_id
        hop_pub_key: pub_key
        hop_amount_to_forward: amount_to_forward {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        hop_fee: fee {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        hop_expiry: expiry
    }
    ... on ChannelOpeningTransaction {
        __typename
        channel_opening_transaction_id: id
        channel_opening_transaction_created_at: created_at
        channel_opening_transaction_updated_at: updated_at
        channel_opening_transaction_status: status
        channel_opening_transaction_resolved_at: resolved_at
        channel_opening_transaction_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_opening_transaction_transaction_hash: transaction_hash
        channel_opening_transaction_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_opening_transaction_block_hash: block_hash
        channel_opening_transaction_block_height: block_height
        channel_opening_transaction_destination_addresses: destination_addresses
        channel_opening_transaction_num_confirmations: num_confirmations
        channel_opening_transaction_channel: channel {
            id
        }
    }
    ... on ChannelClosingTransaction {
        __typename
        channel_closing_transaction_id: id
        channel_closing_transaction_created_at: created_at
        channel_closing_transaction_updated_at: updated_at
        channel_closing_transaction_status: status
        channel_closing_transaction_resolved_at: resolved_at
        channel_closing_transaction_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_closing_transaction_transaction_hash: transaction_hash
        channel_closing_transaction_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        channel_closing_transaction_block_hash: block_hash
        channel_closing_transaction_block_height: block_height
        channel_closing_transaction_destination_addresses: destination_addresses
        channel_closing_transaction_num_confirmations: num_confirmations
        channel_closing_transaction_channel: channel {
            id
        }
    }
    ... on Deposit {
        __typename
        deposit_id: id
        deposit_created_at: created_at
        deposit_updated_at: updated_at
        deposit_status: status
        deposit_resolved_at: resolved_at
        deposit_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        deposit_transaction_hash: transaction_hash
        deposit_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        deposit_block_hash: block_hash
        deposit_block_height: block_height
        deposit_destination_addresses: destination_addresses
        deposit_num_confirmations: num_confirmations
        deposit_destination: destination {
            id
        }
    }
    ... on Withdrawal {
        __typename
        withdrawal_id: id
        withdrawal_created_at: created_at
        withdrawal_updated_at: updated_at
        withdrawal_status: status
        withdrawal_resolved_at: resolved_at
        withdrawal_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        withdrawal_transaction_hash: transaction_hash
        withdrawal_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        withdrawal_block_hash: block_hash
        withdrawal_block_height: block_height
        withdrawal_destination_addresses: destination_addresses
        withdrawal_num_confirmations: num_confirmations
        withdrawal_origin: origin {
            id
        }
    }
    ... on RoutingTransaction {
        __typename
        routing_transaction_id: id
        routing_transaction_created_at: created_at
        routing_transaction_updated_at: updated_at
        routing_transaction_status: status
        routing_transaction_resolved_at: resolved_at
        routing_transaction_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        routing_transaction_transaction_hash: transaction_hash
        routing_transaction_incoming_channel: incoming_channel {
            id
        }
        routing_transaction_outgoing_channel: outgoing_channel {
            id
        }
        routing_transaction_fees: fees {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        routing_transaction_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
        routing_transaction_failure_reason: failure_reason
    }
    ... on IncomingPayment {
        __typename
        incoming_payment_id: id
        incoming_payment_created_at: created_at
        incoming_payment_updated_at: updated_at
        incoming_payment_status: status
        incoming_payment_resolved_at: resolved_at
        incoming_payment_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        incoming_payment_transaction_hash: transaction_hash
        incoming_payment_origin: origin {
            id
        }
        incoming_payment_destination: destination {
            id
        }
        incoming_payment_payment_request: payment_request {
            id
        }
    }
    ... on IncomingPaymentAttempt {
        __typename
        incoming_payment_attempt_id: id
        incoming_payment_attempt_created_at: created_at
        incoming_payment_attempt_updated_at: updated_at
        incoming_payment_attempt_status: status
        incoming_payment_attempt_resolved_at: resolved_at
        incoming_payment_attempt_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        incoming_payment_attempt_channel: channel {
            id
        }
    }
    ... on GraphNode {
        __typename
        graph_node_id: id
        graph_node_created_at: created_at
        graph_node_updated_at: updated_at
        graph_node_alias: alias
        graph_node_bitcoin_network: bitcoin_network
        graph_node_color: color
        graph_node_conductivity: conductivity
        graph_node_display_name: display_name
        graph_node_public_key: public_key
    }
    ... on Invoice {
        __typename
        invoice_id: id
        invoice_created_at: created_at
        invoice_updated_at: updated_at
        invoice_data: data {
            __typename
            invoice_data_encoded_payment_request: encoded_payment_request
            invoice_data_bitcoin_network: bitcoin_network
            invoice_data_payment_hash: payment_hash
            invoice_data_amount: amount {
                __typename
                currency_amount_value: value
                currency_amount_unit: unit
            }
            invoice_data_created_at: created_at
            invoice_data_expires_at: expires_at
            invoice_data_destination: destination {
                __typename
                ... on LightsparkNode {
                    __typename
                    lightspark_node_id: id
                    lightspark_node_created_at: created_at
                    lightspark_node_updated_at: updated_at
                    lightspark_node_alias: alias
                    lightspark_node_bitcoin_network: bitcoin_network
                    lightspark_node_color: color
                    lightspark_node_conductivity: conductivity
                    lightspark_node_display_name: display_name
                    lightspark_node_public_key: public_key
                    lightspark_node_account: account {
                        id
                    }
                    lightspark_node_blockchain_balance: blockchain_balance {
                        __typename
                        blockchain_balance_total_balance: total_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_confirmed_balance: confirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_locked_balance: locked_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_required_reserve: required_reserve {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_available_balance: available_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                    }
                    lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encryption_public_key: encryption_public_key {
                        __typename
                        key_type: type
                        key_public_key: public_key
                    }
                    lightspark_node_grpc_hostname: grpc_hostname
                    lightspark_node_local_balance: local_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_name: name
                    lightspark_node_purpose: purpose
                    lightspark_node_remote_balance: remote_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_rest_url: rest_url
                    lightspark_node_status: status
                    lightspark_node_upgrade_available: upgrade_available
                    lightspark_node_has_channel_funding_op: has_channel_funding_op
                }
                ... on GraphNode {
                    __typename
                    graph_node_id: id
                    graph_node_created_at: created_at
                    graph_node_updated_at: updated_at
                    graph_node_alias: alias
                    graph_node_bitcoin_network: bitcoin_network
                    graph_node_color: color
                    graph_node_conductivity: conductivity
                    graph_node_display_name: display_name
                    graph_node_public_key: public_key
                }
            }
            invoice_data_memo: memo
        }
        invoice_status: status
        invoice_amount_paid: amount_paid {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
    }
    ... on PhoneLoginFactor {
        __typename
        phone_login_factor_id: id
        phone_login_factor_created_at: created_at
        phone_login_factor_updated_at: updated_at
        phone_login_factor_verification_date: verification_date
        phone_login_factor_phone_number: phone_number
    }
    ... on TotpLoginFactor {
        __typename
        totp_login_factor_id: id
        totp_login_factor_created_at: created_at
        totp_login_factor_updated_at: updated_at
        totp_login_factor_verification_date: verification_date
        totp_login_factor_version: version
    }
    ... on WebAuthnLoginFactor {
        __typename
        web_authn_login_factor_id: id
        web_authn_login_factor_created_at: created_at
        web_authn_login_factor_updated_at: updated_at
        web_authn_login_factor_verification_date: verification_date
        web_authn_login_factor_name: name
    }
    ... on ApiToken {
        __typename
        api_token_id: id
        api_token_created_at: created_at
        api_token_updated_at: updated_at
        api_token_client_id: client_id
        api_token_name: name
    }
}`;

export default Entity;
