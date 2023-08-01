// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import Observable from "zen-observable";

import {
  AuthProvider,
  b64encode,
  CryptoInterface,
  DefaultCrypto,
  KeyOrAlias,
  KeyOrAliasType,
  LightsparkAuthException,
  LightsparkException,
  LightsparkSigningException,
  Maybe,
  NodeKeyCache,
  Query,
  Requester,
  StubAuthProvider,
} from "@lightsparkdev/core";
import {
  type OutgoingPayment as GQLOutgoingPayment,
  type Subscription as GQLSubscription,
} from "@lightsparkdev/gql/generated/graphql.js";
import { createHash } from "crypto";
import packageJson from "../package.json";
import { BitcoinFeeEstimate as BitcoinFeeEstimateQuery } from "./graphql/BitcoinFeeEstimate.js";
import { CreateApiToken } from "./graphql/CreateApiToken.js";
import { CreateInvoice } from "./graphql/CreateInvoice.js";
import { CreateLnurlInvoice } from "./graphql/CreateLnurlInvoice.js";
import { CreateNodeWalletAddress } from "./graphql/CreateNodeWalletAddress.js";
import { CreateTestModeInvoice } from "./graphql/CreateTestModeInvoice.js";
import { CreateTestModePayment } from "./graphql/CreateTestModePayment.js";
import { DecodeInvoice } from "./graphql/DecodeInvoice.js";
import { DeleteApiToken } from "./graphql/DeleteApiToken.js";
import { FundNode } from "./graphql/FundNode.js";
import { LightningFeeEstimateForInvoice } from "./graphql/LightningFeeEstimateForInvoice.js";
import { LightningFeeEstimateForNode } from "./graphql/LightningFeeEstimateForNode.js";
import {
  AccountDashboard,
  MultiNodeDashboard,
} from "./graphql/MultiNodeDashboard.js";
import { PayInvoice } from "./graphql/PayInvoice.js";
import { RecoverNodeSigningKey } from "./graphql/RecoverNodeSigningKey.js";
import { RequestWithdrawal } from "./graphql/RequestWithdrawal.js";
import { SendPayment } from "./graphql/SendPayment.js";
import { SingleNodeDashboard as SingleNodeDashboardQuery } from "./graphql/SingleNodeDashboard.js";
import { TransactionsForNode } from "./graphql/TransactionsForNode.js";
import { TransactionSubscription } from "./graphql/TransactionSubscription.js";
import Account from "./objects/Account.js";
import { ApiTokenFromJson } from "./objects/ApiToken.js";
import BitcoinNetwork from "./objects/BitcoinNetwork.js";
import CreateApiTokenOutput from "./objects/CreateApiTokenOutput.js";
import CurrencyAmount, {
  CurrencyAmountFromJson,
} from "./objects/CurrencyAmount.js";
import FeeEstimate, { FeeEstimateFromJson } from "./objects/FeeEstimate.js";
import Invoice, { InvoiceFromJson } from "./objects/Invoice.js";
import InvoiceData, { InvoiceDataFromJson } from "./objects/InvoiceData.js";
import InvoiceType from "./objects/InvoiceType.js";
import OutgoingPayment, {
  OutgoingPaymentFromJson,
} from "./objects/OutgoingPayment.js";
import Permission from "./objects/Permission.js";
import SingleNodeDashboard from "./objects/SingleNodeDashboard.js";
import Transaction, { TransactionFromJson } from "./objects/Transaction.js";
import TransactionUpdate, {
  TransactionUpdateFromJson,
} from "./objects/TransactionUpdate.js";
import WithdrawalMode from "./objects/WithdrawalMode.js";
import WithdrawalRequest, {
  WithdrawalRequestFromJson,
} from "./objects/WithdrawalRequest.js";

const sdkVersion = packageJson.version;

/**
 * The LightsparkClient is the main entrypoint for interacting with the Lightspark API.
 *
 * ```ts
 * const lightsparkClient = new LightsparkClient(
 *  new AccountTokenAuthProvider(TOKEN_ID, TOKEN_SECRET)
 * );
 * const encodedInvoice = await lightsparkClient.createInvoice(
 *   RECEIVING_NODE_ID,
 *   { value: 100, unit: CurrencyUnit.SATOSHI },
 *   "Whasssupppp",
 *   InvoiceType.AMP,
 * );
 *
 * const invoiceDetails = await lightsparkClient.decodeInvoice(encodedInvoice);
 * console.log(invoiceDetails);
 *
 * const payment = await lightsparkClient.payInvoice(PAYING_NODE_ID, encodedInvoice, 100000);
 * console.log(payment);
 * ```
 *
 * @class LightsparkClient
 */
class LightsparkClient {
  private requester: Requester;
  private readonly nodeKeyCache: NodeKeyCache;

  /**
   * Constructs a new LightsparkClient.
   *
   * @param authProvider The auth provider to use for authentication. Defaults to a stub auth provider. For server-side
   *     use, you should use the `AccountTokenAuthProvider`.
   * @param serverUrl The base URL of the server to connect to. Defaults to lightspark production.
   * @param cryptoImpl The crypto implementation to use. Defaults to web and node compatible crypto.
   *     For React Native, you should use the `ReactNativeCrypto` implementation from `@lightsparkdev/react-native`.
   */
  constructor(
    private authProvider: AuthProvider = new StubAuthProvider(),
    private readonly serverUrl: string = "api.lightspark.com",
    private readonly cryptoImpl: CryptoInterface = DefaultCrypto
  ) {
    this.nodeKeyCache = new NodeKeyCache(this.cryptoImpl);
    this.requester = new Requester(
      this.nodeKeyCache,
      LIGHTSPARK_SDK_ENDPOINT,
      `js-lightspark-sdk/${sdkVersion}`,
      authProvider,
      serverUrl,
      this.cryptoImpl
    );

    autoBind(this);
  }

  /**
   * Sets the auth provider for the client. This is useful for switching between auth providers if you are using
   * multiple accounts or waiting for the user to log in.
   *
   * @param authProvider
   */
  public async setAuthProvider(authProvider: AuthProvider) {
    this.requester = new Requester(
      this.nodeKeyCache,
      LIGHTSPARK_SDK_ENDPOINT,
      `js-lightspark-sdk/${sdkVersion}`,
      authProvider,
      this.serverUrl,
      this.cryptoImpl
    );
    this.authProvider = authProvider;
  }

  /**
   * @returns Whether or not the client is authorized. This is useful for determining if the user is logged in or not.
   */
  public async isAuthorized(): Promise<boolean> {
    return this.authProvider.isAuthorized();
  }

  /**
   * @returns The current account, if one exists.
   */
  public async getCurrentAccount(): Promise<Maybe<Account>> {
    return await this.requester.executeQuery<Account>(
      Account.getAccountQuery()
    );
  }

  /**
   * Retrieves the most recent transactions for a given node.
   *
   * @param nodeId The node ID for which to read transactions
   * @param numTransactions The maximum number of transactions to read. Defaults to 20.
   * @param bitcoinNetwork The bitcoin network on which to read transactions. Defaults to MAINNET.
   * @param afterDate Filters transactions to those after the given date. Defaults to undefined (no limit).
   * @returns An array of transactions for the given node ID.
   */
  public async getRecentTransactions(
    nodeId: string,
    numTransactions: number = 20,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET,
    afterDate: Maybe<string> = undefined
  ): Promise<Transaction[]> {
    const response = await this.requester.makeRawRequest(TransactionsForNode, {
      nodeId,
      network: bitcoinNetwork,
      numTransactions,
      afterDate,
    });
    return (
      response.current_account?.recent_transactions.entities.map(
        (transaction) => TransactionFromJson(transaction)
      ) ?? []
    );
  }

  /**
   * Starts listening for new transactions or updates to existing transactions for a list of nodes.
   *
   * @param nodeIds The node IDs for which to listen to transactions.
   * @returns A zen-observable that emits transaction updates for the given node IDs.
   */
  public listenToTransactions(
    nodeIds: string[]
  ): Observable<TransactionUpdate | undefined> {
    const response = this.requester.subscribe<
      Pick<GQLSubscription, "transactions">
    >(TransactionSubscription, {
      nodeIds,
    });
    return response.map(
      (response) =>
        response &&
        response.data.transactions &&
        TransactionUpdateFromJson(response.data.transactions)
    );
  }

  /**
   * Retrieves a dashboard of basic info for the authenticated account. See `AccountDashboard` for which info is
   * included.
   *
   * @param nodeIds The node IDs to include in the dashboard. Defaults to undefined (all nodes).
   * @param bitcoinNetwork The bitcoin network to include in the dashboard. Defaults to MAINNET.
   * @returns A basic account dashboard for the given node IDs.
   * @throws LightsparkAuthException if the user is not logged in or a LightsparkException if no nodes are found.
   */
  public async getAccountDashboard(
    nodeIds: string[] | undefined = undefined,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET
  ): Promise<AccountDashboard> {
    const response = await this.requester.makeRawRequest(MultiNodeDashboard, {
      nodeIds: nodeIds,
      network: bitcoinNetwork,
    });
    if (!response.current_account) {
      throw new LightsparkAuthException("No current account");
    }
    if (
      !response.current_account.dashboard_overview_nodes ||
      response.current_account.dashboard_overview_nodes.entities.length === 0
    ) {
      throw new LightsparkException(
        "NO_NODES_FOUND",
        `No nodes found for this dashboard request. This could mean one of a few things:
        1. You are requesting MAINNET nodes, but you have no MAINNET nodes yet. In this case, request BitcoinNetwork.REGTEST instead.
        2. You are specifying specific node IDs, but those IDs don't exist or are not on the bitcoid network you requested.
        3. The api token or authentication mechanism you are using is not authorized to access the nodes you requested. If you're using
           an API token, make sure it has the correct permissions for the desired network (only test tokens have access to REGTEST nodes).`
      );
    }
    const account = response.current_account;
    return {
      id: account.id,
      name: account.name,
      nodes: account.dashboard_overview_nodes.entities.map((node) => {
        return {
          color: node.color,
          displayName: node.display_name,
          purpose: node.purpose,
          id: node.id,
          publicKey: node.public_key,
          status: node.status,
          addresses: {
            count: node.addresses.count,
            entities: node.addresses.entities.map((address) => {
              return {
                address: address.address,
                type: address.type,
              };
            }),
          },
          localBalance:
            node.local_balance && CurrencyAmountFromJson(node.local_balance),
          remoteBalance:
            node.remote_balance && CurrencyAmountFromJson(node.remote_balance),
          blockchainBalance:
            node.blockchain_balance &&
            CurrencyAmountFromJson(node.blockchain_balance),
        };
      }),
      blockchainBalance: !!account.blockchain_balance
        ? {
            l1Balance:
              account.blockchain_balance.l1_balance &&
              CurrencyAmountFromJson(account.blockchain_balance.l1_balance),
            requiredReserve:
              account.blockchain_balance.required_reserve &&
              CurrencyAmountFromJson(
                account.blockchain_balance.required_reserve
              ),
            availableBalance:
              account.blockchain_balance.available_balance &&
              CurrencyAmountFromJson(
                account.blockchain_balance.available_balance
              ),
            unconfirmedBalance:
              account.blockchain_balance.unconfirmed_balance &&
              CurrencyAmountFromJson(
                account.blockchain_balance.unconfirmed_balance
              ),
          }
        : null,
      localBalance:
        account.local_balance && CurrencyAmountFromJson(account.local_balance),
      remoteBalance:
        account.remote_balance &&
        CurrencyAmountFromJson(account.remote_balance),
    };
  }

  /**
   * Gets a basic dashboard for a single node, including recent transactions. See `SingleNodeDashboard` for which info is
   * included.
   *
   * @param nodeId The node ID for which to get a dashboard.
   * @param bitcoinNetwork The bitcoin network for which to get a dashboard. Defaults to MAINNET.
   * @param transactionsAfterDate Filters recent transactions to those after the given date.
   *     Defaults to undefined (no limit).
   * @returns A basic dashboard for the given node ID.
   */
  public async getSingleNodeDashboard(
    nodeId: string,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET,
    transactionsAfterDate: Maybe<string> = undefined
  ): Promise<SingleNodeDashboard> {
    const response = await this.requester.makeRawRequest(
      SingleNodeDashboardQuery,
      {
        nodeId: nodeId,
        network: bitcoinNetwork,
        numTransactions: 20,
        transactionsAfterDate,
      }
    );
    if (!response.current_account) {
      throw new LightsparkAuthException("No current account");
    }
    const account = response.current_account;
    if (
      !account.dashboard_overview_nodes ||
      !account.dashboard_overview_nodes.entities ||
      account.dashboard_overview_nodes.entities.length === 0
    ) {
      throw new LightsparkException(
        "InvalidOrMissingNode",
        "No nodes found for node dashboard"
      );
    }
    const node = account.dashboard_overview_nodes.entities[0];
    const nodeAddresses = node.addresses.entities.map((address) => {
      return {
        address: address.address,
        type: address.type,
      };
    });
    const currencyAmountOrUndefined = (json) => {
      return json && CurrencyAmountFromJson(json);
    };
    return {
      color: node.color,
      displayName: account.name,
      purpose: node.purpose,
      id: node.id,
      publicKey: node.public_key,
      status: node.status,
      addresses: nodeAddresses,
      totalBalance: currencyAmountOrUndefined(node.total_balance),
      totalLocalBalance: currencyAmountOrUndefined(node.total_local_balance),
      onlineLocalBalance: currencyAmountOrUndefined(node.local_balance),
      remoteBalance: currencyAmountOrUndefined(node.remote_balance),
      blockchainBalance: node.blockchain_balance && {
        availableBalance: currencyAmountOrUndefined(
          node.blockchain_balance.available_balance
        ),
        confirmedBalance: currencyAmountOrUndefined(
          node.blockchain_balance.confirmed_balance
        ),
        unconfirmedBalance: currencyAmountOrUndefined(
          node.blockchain_balance.unconfirmed_balance
        ),
        totalBalance: currencyAmountOrUndefined(
          node.blockchain_balance.total_balance
        ),
      },
      recentTransactions:
        account.recent_transactions?.entities.map((tx) => {
          return TransactionFromJson(tx);
        }) || [],
    };
  }

  /**
   * Creates an invoice for the given node.
   *
   * Test mode note: You can simulate a payment of this invoice in test move using [createTestModePayment].
   *
   * @param nodeId The node ID for which to create an invoice.
   * @param amountMsats The amount of the invoice in msats. You can create a zero-amount invoice to accept any payment amount.
   * @param memo A string memo to include in the invoice as a description.
   * @param type The type of invoice to create. Defaults to a normal payment invoice, but you can pass InvoiceType.AMP
   *     to create an [AMP invoice](https://docs.lightning.engineering/lightning-network-tools/lnd/amp), which can be
   *     paid multiple times.
   * @returns An encoded payment request for the invoice, or undefined if the invoice could not be created.
   */
  public async createInvoice(
    nodeId: string,
    amountMsats: number,
    memo: string,
    type: InvoiceType | undefined = undefined
  ): Promise<string | undefined> {
    const response = await this.requester.makeRawRequest(CreateInvoice, {
      node_id: nodeId,
      amount_msats: amountMsats,
      memo,
      type,
    });
    return response.create_invoice?.invoice.data?.encoded_payment_request;
  }

  /**
   * Generates a Lightning Invoice (follows the Bolt 11 specification) to request a payment
   * from another Lightning Node. This should only be used for generating invoices for LNURLs,
   * with [createInvoice] preferred in the general case.
   *
   * Test mode note: You can simulate a payment of this invoice in test move using [createTestModePayment].
   *
   * @param nodeId The node ID for which to create an invoice.
   * @param amountMsats The amount of the invoice in msats. You can create a zero-amount invoice to accept any payment amount.
   * @param metadata The LNURL metadata payload field in the initial payreq response. This wil be hashed and present in the
   *     h-tag (SHA256 purpose of payment) of the resulting Bolt 11 invoice. See
   *     [this spec](https://github.com/lnurl/luds/blob/luds/06.md#pay-to-static-qrnfclink) for details.
   * @returns An Invoice object representing the generated invoice.
   */
  public async createLnurlInvoice(
    nodeId: string,
    amountMsats: number,
    metadata: string
  ): Promise<Invoice | undefined> {
    const response = await this.requester.makeRawRequest(CreateLnurlInvoice, {
      node_id: nodeId,
      amount_msats: amountMsats,
      metadata_hash: createHash("sha256").update(metadata).digest("hex"),
    });
    const invoiceJson = response.create_lnurl_invoice?.invoice;
    if (!invoiceJson) {
      return undefined;
    }
    return InvoiceFromJson(invoiceJson);
  }

  /**
   * Decodes an encoded lightning invoice string.
   *
   * @param encodedInvoice The string encoded invoice to decode.
   * @returns Decoded invoice data.
   */
  public async decodeInvoice(encodedInvoice: string): Promise<InvoiceData> {
    const response = await this.requester.makeRawRequest(DecodeInvoice, {
      encoded_payment_request: encodedInvoice,
    });
    return InvoiceDataFromJson(response.decoded_payment_request);
  }

  /**
   * Gets an estimate of the fee for sending a payment over the given bitcoin network.
   *
   * @param bitcoinNetwork The bitcoin network for which to get a fee estimate. Defaults to MAINNET.
   * @returns A fee estimate for the given bitcoin network including a minimum fee rate, and a max-speed fee rate.
   */
  public async getBitcoinFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET
  ): Promise<FeeEstimate> {
    const response = await this.requester.makeRawRequest(
      BitcoinFeeEstimateQuery,
      {
        bitcoin_network: bitcoinNetwork,
      }
    );
    return FeeEstimateFromJson(response.bitcoin_fee_estimate);
  }

  /**
   * Gets an estimate of the fees that will be paid for a Lightning invoice.
   *
   * @param nodeId The node from where you want to send the payment.
   * @param encodedPaymentRequest The invoice you want to pay (as defined by the BOLT11 standard).
   * @param amountMsats If the invoice does not specify a payment amount, then the amount that you wish to pay,
   *     expressed in msats.
   * @returns An estimate of the fees that will be paid for a Lightning invoice.
   */
  public async getLightningFeeEstimateForInvoice(
    nodeId: string,
    encodedPaymentRequest: string,
    amountMsats: number | undefined = undefined
  ): Promise<CurrencyAmount> {
    const response = await this.requester.makeRawRequest(
      LightningFeeEstimateForInvoice,
      {
        node_id: nodeId,
        encoded_payment_request: encodedPaymentRequest,
        amount_msats: amountMsats,
      }
    );
    return CurrencyAmountFromJson(
      response.lightning_fee_estimate_for_invoice.fee_estimate
    );
  }

  /**
   * Returns an estimate of the fees that will be paid to send a payment to another Lightning node.
   *
   * @param nodeId The node from where you want to send the payment.
   * @param destinationNodePublicKey The public key of the node that you want to pay.
   * @param amountMsats The payment amount expressed in msats.
   * @returns An estimate of the fees that will be paid to send a payment to another Lightning node.
   */
  public async getLightningFeeEstimateForNode(
    nodeId: string,
    destinationNodePublicKey: string,
    amountMsats: number
  ): Promise<CurrencyAmount> {
    const response = await this.requester.makeRawRequest(
      LightningFeeEstimateForNode,
      {
        node_id: nodeId,
        destination_node_public_key: destinationNodePublicKey,
        amount_msats: amountMsats,
      }
    );
    return CurrencyAmountFromJson(
      response.lightning_fee_estimate_for_node.fee_estimate
    );
  }

  /**
   * Unlock the given node for sensitive operations like sending payments.
   *
   * @param nodeId The ID of the node to unlock.
   * @param password The node password assigned at node creation.
   * @returns True if the node was unlocked successfully, false otherwise.
   */
  public async unlockNode(nodeId: string, password: string): Promise<boolean> {
    const encryptedKey = await this.recoverNodeSigningKey(nodeId);
    if (!encryptedKey) {
      console.warn("No encrypted key found for node " + nodeId);
      return false;
    }

    const signingPrivateKey =
      await this.cryptoImpl.decryptSecretWithNodePassword(
        encryptedKey.cipher,
        encryptedKey.encrypted_value,
        password
      );

    if (!signingPrivateKey) {
      throw new LightsparkSigningException(
        "Unable to decrypt signing key with provided password. Please try again."
      );
    }

    let signingPrivateKeyPEM = "";
    if (new Uint8Array(signingPrivateKey)[0] === 48) {
      // Support DER format - https://github.com/lightsparkdev/webdev/pull/1982
      signingPrivateKeyPEM = b64encode(signingPrivateKey);
    } else {
      const dec = new TextDecoder();
      signingPrivateKeyPEM = dec.decode(signingPrivateKey);
    }

    await this.nodeKeyCache.loadKey(
      nodeId,
      KeyOrAlias.key(signingPrivateKeyPEM)
    );
    return true;
  }

  private async recoverNodeSigningKey(
    nodeId: string
  ): Promise<Maybe<{ encrypted_value: string; cipher: string }>> {
    const response = await this.requester.makeRawRequest(
      RecoverNodeSigningKey,
      { nodeId }
    );
    const nodeEntity = response.entity;
    if (nodeEntity?.__typename === "LightsparkNode") {
      return nodeEntity.encrypted_signing_private_key;
    }
    return null;
  }

  /**
   * Directly unlocks a node with a signing private key or alias.
   *
   * @param nodeId The ID of the node to unlock.
   * @param signingPrivateKeyPEM The PEM-encoded signing private key.
   */
  public async loadNodeKey(
    nodeId: string,
    signingPrivateKeyOrAlias: KeyOrAliasType
  ) {
    await this.nodeKeyCache.loadKey(nodeId, signingPrivateKeyOrAlias);
  }

  /**
   * Sends a lightning payment for a given invoice.
   *
   * Test mode note: For test mode, you can use the [createTestModeInvoice] function to create an invoice you can
   * pay in test mode.
   *
   * @param payerNodeId The ID of the node that will pay the invoice.
   * @param encodedInvoice The encoded invoice to pay.
   * @param maximumFeesMsats Maximum fees (in msats) to pay for the payment. This parameter is required.
   *     As guidance, a maximum fee of 16 basis points should make almost all transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats, this would mean a fee limit of 16 to 160 sats.
   * @param timeoutSecs A timeout for the payment in seconds. Defaults to 60 seconds.
   * @param amountMsats The amount to pay in msats for a zero-amount invoice. Defaults to the full amount of the
   *     invoice. NOTE: This parameter can only be passed for a zero-amount invoice. Otherwise, the call will fail.
   * @returns An `OutgoingPayment` object if the payment was successful, or undefined if the payment failed.
   */
  public async payInvoice(
    payerNodeId: string,
    encodedInvoice: string,
    maximumFeesMsats: number,
    timeoutSecs: number = 60,
    amountMsats: number | undefined = undefined
  ): Promise<OutgoingPayment | undefined> {
    if (!this.nodeKeyCache.hasKey(payerNodeId)) {
      throw new LightsparkSigningException("Paying node is not unlocked");
    }
    const variables: Record<string, string | number> = {
      node_id: payerNodeId,
      encoded_invoice: encodedInvoice,
      timeout_secs: timeoutSecs,
      maximum_fees_msats: maximumFeesMsats,
    };
    if (amountMsats !== undefined) {
      variables.amount_msats = amountMsats;
    }
    const response = await this.requester.makeRawRequest(
      PayInvoice,
      variables,
      payerNodeId
    );
    if (response.pay_invoice?.payment.outgoing_payment_failure_message) {
      throw new LightsparkException(
        "PaymentError",
        response.pay_invoice?.payment.outgoing_payment_failure_message.rich_text_text
      );
    }
    return (
      response.pay_invoice &&
      OutgoingPaymentFromJson(response.pay_invoice.payment)
    );
  }

  /**
   * Sends a payment directly to a node on the Lightning Network through the public key of the node without an invoice.
   *
   * @param payerNodeId The ID of the node that will send the payment.
   * @param destinationPublicKey The public key of the destination node.
   * @param timeoutSecs The timeout in seconds that we will try to make the payment.
   * @param amountMsats The amount to pay in msats.
   * @param maximumFeesMsats Maximum fees (in msats) to pay for the payment. This parameter is required.
   *     As guidance, a maximum fee of 15 basis points should make almost all transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats, this would mean a fee limit of 15 to 150 sats.
   * @returns An `OutgoingPayment` object if the payment was successful, or undefined if the payment failed.
   */
  public async sendPayment(
    payerNodeId: string,
    destinationPublicKey: string,
    timeoutSecs: number = 60,
    amountMsats: number,
    maximumFeesMsats: number
  ): Promise<OutgoingPayment | undefined> {
    if (!this.nodeKeyCache.hasKey(payerNodeId)) {
      throw new LightsparkSigningException("Paying node is not unlocked");
    }
    const response = await this.requester.makeRawRequest(
      SendPayment,
      {
        node_id: payerNodeId,
        destination_public_key: destinationPublicKey,
        timeout_secs: timeoutSecs,
        amount_msats: amountMsats,
        maximum_fees_msats: maximumFeesMsats,
      },
      payerNodeId
    );
    if (response.send_payment?.payment.outgoing_payment_failure_message) {
      throw new LightsparkException(
        "PaymentError",
        response.send_payment?.payment.outgoing_payment_failure_message.rich_text_text
      );
    }
    return (
      response.send_payment &&
      OutgoingPaymentFromJson(response.send_payment.payment)
    );
  }

  /**
   * Creates an L1 Bitcoin wallet address for a given node which can be used to deposit or withdraw funds.
   *
   * @param nodeId The ID of the node to create a wallet address for.
   * @returns A string containing the wallet address for the given node.
   */
  public async createNodeWalletAddress(nodeId: string): Promise<string> {
    const response = await this.requester.makeRawRequest(
      CreateNodeWalletAddress,
      { node_id: nodeId }
    );
    return response.create_node_wallet_address.wallet_address;
  }

  /**
   * Withdraws funds from the account and sends it to the requested bitcoin address.
   *
   * Depending on the chosen mode, it will first take the funds from the wallet, and if applicable, close channels
   * appropriately to recover enough funds and reopen channels with the remaining funds.
   * The process is asynchronous and may take up to a few minutes. You can check the progress by polling the
   * `WithdrawalRequest` that is created, or by subscribing to a webhook.
   *
   * @param nodeId The ID of the node from which to withdraw funds.
   * @param amountSats The amount of funds to withdraw in satoshis.
   * @param bitcoinAddress The Bitcoin address to withdraw funds to.
   * @param mode The mode to use for the withdrawal. See `WithdrawalMode` for more information.
   */
  public async requestWithdrawal(
    nodeId: string,
    amountSats: number,
    bitcoinAddress: string,
    mode: WithdrawalMode
  ): Promise<WithdrawalRequest> {
    const response = await this.requester.makeRawRequest(
      RequestWithdrawal,
      {
        node_id: nodeId,
        amount_sats: amountSats,
        bitcoin_address: bitcoinAddress,
        withdrawal_mode: mode,
      },
      nodeId
    );
    return WithdrawalRequestFromJson(response.request_withdrawal.request);
  }

  /**
   * Adds funds to a Lightspark node on the REGTEST network. If the amount is not specified, 10,000,000 SATOSHI will be
   * added. This API only functions for nodes created on the REGTEST network and will return an error when called for
   * any non-REGTEST node.
   *
   * @param nodeId The ID of the node to fund. Must be a REGTEST node.
   * @param amountSats The amount of funds to add to the node in satoshis. Defaults to 10,000,000 SATOSHI.
   * @returns
   */
  public async fundNode(
    nodeId: string,
    amountSats: number | undefined = undefined
  ): Promise<CurrencyAmount> {
    const response = await this.requester.makeRawRequest(FundNode, {
      node_id: nodeId,
      amount_sats: amountSats,
    });
    return CurrencyAmountFromJson(response.fund_node.amount);
  }

  /**
   * Creates a new API token that can be used to authenticate requests for this account when using the Lightspark APIs
   * and SDKs.
   *
   * @param name Creates a new API token that can be used to authenticate requests for this account when using the
   *     Lightspark APIs and SDKs.
   * @param transact Whether the token should be able to transact or only view data.
   * @param testMode True if the token should be able to access only testnet false to access only mainnet.
   * @returns An object containing the API token and client secret.
   */
  public async createApiToken(
    name: string,
    transact: boolean = true,
    testMode: boolean = true
  ): Promise<CreateApiTokenOutput> {
    let permissions: Permission[];
    if (transact && testMode) {
      permissions = [Permission.REGTEST_VIEW, Permission.REGTEST_TRANSACT];
    } else if (transact && !testMode) {
      permissions = [Permission.MAINNET_VIEW, Permission.MAINNET_TRANSACT];
    } else if (!transact && testMode) {
      permissions = [Permission.REGTEST_VIEW];
    } else {
      permissions = [Permission.MAINNET_VIEW];
    }

    const response = await this.requester.makeRawRequest(CreateApiToken, {
      name,
      permissions,
    });
    return {
      apiToken: ApiTokenFromJson(response.create_api_token.api_token),
      clientSecret: response.create_api_token.client_secret,
    };
  }

  /**
   * Deletes an existing API token from this account.
   *
   * @param id The ID of the API token to delete.
   */
  public async deleteApiToken(id: string): Promise<void> {
    await this.requester.makeRawRequest(DeleteApiToken, { api_token_id: id });
  }

  /**
   * In test mode, generates a Lightning Invoice which can be paid by a local node.
   * This call is only valid in test mode. You can then pay the invoice using [payInvoice].
   *
   * @param localNodeId The ID of the node that will pay the invoice.
   * @param amountMsats The amount to pay in milli-satoshis.
   * @param memo An optional memo to attach to the invoice.
   * @param invoiceType The type of invoice to create.
   */
  public async createTestModeInvoice(
    localNodeId: string,
    amountMsats: number,
    memo: string | undefined = undefined,
    invoiceType: InvoiceType = InvoiceType.STANDARD
  ): Promise<string | null> {
    return await this.executeRawQuery({
      queryPayload: CreateTestModeInvoice,
      variables: {
        local_node_id: localNodeId,
        amount_msats: amountMsats,
        memo,
        invoice_type: invoiceType,
      },
      constructObject: (responseJson: {
        create_test_mode_invoice: {
          encoded_payment_request: string;
        } | null;
      }) => {
        const encodedPaymentRequest =
          responseJson.create_test_mode_invoice?.encoded_payment_request;
        if (!encodedPaymentRequest) {
          throw new LightsparkException(
            "CreateTestModeInvoiceError",
            "Unable to create test mode invoice"
          );
        }
        return encodedPaymentRequest;
      },
    });
  }

  /**
   * In test mode, simulates a payment of a Lightning Invoice from another node.
   * This can only be used in test mode and should be used with invoices generated by [createInvoice].
   *
   * @param localNodeId The ID of the node that will receive the payment.
   * @param encodedInvoice The encoded invoice to pay.
   * @param amountMsats The amount to pay in milli-satoshis for 0-amount invoices. This should be null for non-zero
   *     amount invoices.
   */
  public async createTestModePayment(
    localNodeId: string,
    encodedInvoice: string,
    amountMsats: number | undefined = undefined
  ): Promise<OutgoingPayment | null> {
    return await this.executeRawQuery({
      queryPayload: CreateTestModePayment,
      variables: {
        local_node_id: localNodeId,
        encoded_invoice: encodedInvoice,
        amount_msats: amountMsats,
      },
      constructObject: (responseJson: {
        create_test_mode_payment: {
          payment: GQLOutgoingPayment;
        } | null;
      }) => {
        return OutgoingPaymentFromJson(
          responseJson.create_test_mode_payment?.payment
        );
      },
    });
  }

  /**
   * Executes a raw `Query` against the Lightspark API.
   *
   * This generally should not be used directly, but is exposed for advanced use cases and for internal use to retrieve
   * complex fields from objects.
   *
   * @param query The `Query` to execute.
   * @returns The result of the query.
   */
  public executeRawQuery<T>(query: Query<T>): Promise<T | null> {
    return this.requester.executeQuery(query);
  }
}

const LIGHTSPARK_SDK_ENDPOINT = "graphql/server/2023-04-04";

export default LightsparkClient;
