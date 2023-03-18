import autoBind from "auto-bind";
import Observable from "zen-observable";
import Query from "./requester/Query.js";

import AuthProvider from "./auth/AuthProvider.js";
import LightsparkAuthException from "./auth/LightsparkAuthException.js";
import StubAuthProvider from "./auth/StubAuthProvider.js";
import { decryptSecretWithNodePassword } from "./crypto/crypto.js";
import LightsparkSigningException from "./crypto/LightsparkSigningException.js";
import NodeKeyCache from "./crypto/NodeKeyCache.js";
import { CreateApiToken } from "./graphql/CreateApiToken.js";
import { CreateInvoice } from "./graphql/CreateInvoice.js";
import { CreateNodeWalletAddress } from "./graphql/CreateNodeWalletAddress.js";
import { DecodeInvoice } from "./graphql/DecodeInvoice.js";
import { DeleteApiToken } from "./graphql/DeleteApiToken.js";
import { FeeEstimate as FeeEstimateQuery } from "./graphql/FeeEstimate.js";
import { FundNode } from "./graphql/FundNode.js";
import {
  AccountDashboard,
  MultiNodeDashboard,
} from "./graphql/MultiNodeDashboard.js";
import { PayInvoice } from "./graphql/PayInvoice.js";
import { RecoverNodeSigningKey } from "./graphql/RecoverNodeSigningKey.js";
import { RequestWithdrawal } from "./graphql/RequestWithdrawl.js";
import { SendPayment } from "./graphql/SendPayment.js";
import {
  SingleNodeDashboard,
  WalletDashboard,
} from "./graphql/SingleNodeDashboard.js";
import { TransactionsForNode } from "./graphql/TransactionsForNode.js";
import { TransactionSubscription } from "./graphql/TransactionSubscription.js";
import { WithdrawFunds } from "./graphql/WithdrawFunds.js";
import LightsparkException from "./LightsparkException.js";
import Account from "./objects/Account.js";
import { ApiTokenFromJson } from "./objects/ApiToken.js";
import BitcoinNetwork from "./objects/BitcoinNetwork.js";
import CreateApiTokenOutput from "./objects/CreateApiTokenOutput.js";
import CurrencyAmount, {
  CurrencyAmountFromJson,
} from "./objects/CurrencyAmount.js";
import CurrencyAmountInput from "./objects/CurrencyAmountInput.js";
import FeeEstimate, { FeeEstimateFromJson } from "./objects/FeeEstimate.js";
import InvoiceData, { InvoiceDataFromJson } from "./objects/InvoiceData.js";
import InvoiceType from "./objects/InvoiceType.js";
import OutgoingPayment, {
  OutgoingPaymentFromJson,
} from "./objects/OutgoingPayment.js";
import Transaction, { TransactionFromJson } from "./objects/Transaction.js";
import Withdrawal, { WithdrawalFromJson } from "./objects/Withdrawal.js";
import WithdrawalMode from "./objects/WithdrawalMode.js";
import WithdrawalRequest, {
  WithdrawalRequestFromJson,
} from "./objects/WithdrawalRequest.js";
import Requester from "./requester/Requester.js";
import { b64encode } from "./utils/base64.js";
import { Maybe } from "./utils/types.js";

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
 * const payment = await lightsparkClient.payInvoice(PAYING_NODE_ID, encodedInvoice);
 * console.log(payment);
 * ```
 *
 * @class LightsparkClient
 */
class LightsparkClient {
  private requester: Requester;

  /**
   * Constructs a new LightsparkClient.
   *
   * @param authProvider The auth provider to use for authentication. Defaults to a stub auth provider. For server-side
   *     use, you should use the `AccountTokenAuthProvider`.
   * @param serverUrl The base URL of the server to connect to. Defaults to lightspark production.
   * @param nodeKeyCache This is used to cache node keys for the duration of the session. Defaults to a new instance of
   *     `NodeKeyCache`. You should not need to change this.
   */
  constructor(
    private authProvider: AuthProvider = new StubAuthProvider(),
    private readonly serverUrl: string = "api.lightspark.com",
    // TODO: Figure out a way to avoid needing this from the wallet client.
    private readonly nodeKeyCache: NodeKeyCache = new NodeKeyCache()
  ) {
    this.requester = new Requester(this.nodeKeyCache, authProvider, serverUrl);

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
      authProvider,
      this.serverUrl
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
  ): Observable<Transaction | undefined> {
    const response = this.requester.subscribe(TransactionSubscription, {
      nodeIds,
    });
    return response.map(
      (response) =>
        response &&
        response.data.transactions &&
        TransactionFromJson(response.data.transactions)
    );
  }

  /**
   * Retrieves a dashboard of basic info for the authenticated account. See `AccountDashboard` for which info is
   * included.
   *
   * @param nodeIds The node IDs to include in the dashboard. Defaults to undefined (all nodes).
   * @param bitcoinNetwork The bitcoin network to include in the dashboard. Defaults to MAINNET.
   * @returns A basic account dashboard for the given node IDs.
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
   * Gets a basic dashboard for a single node, including recent transactions. See `WalletDashboard` for which info is
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
  ): Promise<WalletDashboard> {
    const response = await this.requester.makeRawRequest(SingleNodeDashboard, {
      nodeId: nodeId,
      network: bitcoinNetwork,
      numTransactions: 20,
      transactionsAfterDate,
    });
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
    return {
      color: node.color,
      displayName: node.display_name,
      purpose: node.purpose,
      id: node.id,
      publicKey: node.public_key,
      status: node.status,
      addresses: nodeAddresses,
      localBalance:
        node.local_balance && CurrencyAmountFromJson(node.local_balance),
      remoteBalance:
        node.remote_balance && CurrencyAmountFromJson(node.remote_balance),
      blockchainBalance:
        node.blockchain_balance &&
        CurrencyAmountFromJson(node.blockchain_balance),
      recentTransactions:
        account.recent_transactions?.entities.map((tx) => {
          return TransactionFromJson(tx);
        }) || [],
    };
  }

  /**
   * Creates an invoice for the given node.
   *
   * @param nodeId The node ID for which to create an invoice.
   * @param amount The amount of the invoice. You can create a zero-amount invoice to accept any payment amount.
   * @param memo A string memo to include in the invoice as a description.
   * @param type The type of invoice to create. Defaults to a normal payment invoice, but you can pass InvoiceType.AMP
   *     to create an [AMP invoice](https://docs.lightning.engineering/lightning-network-tools/lnd/amp), which can be
   *     paid multiple times.
   * @returns An encoded payment request for the invoice, or undefined if the invoice could not be created.
   */
  public async createInvoice(
    nodeId: string,
    amount: CurrencyAmountInput,
    memo: string,
    type: InvoiceType | undefined = undefined
  ): Promise<string | undefined> {
    const response = await this.requester.makeRawRequest(CreateInvoice, {
      nodeId,
      amount,
      memo,
      type,
    });
    return response.create_invoice?.invoice.data?.encoded_payment_request;
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
  public async getFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET
  ): Promise<FeeEstimate> {
    const response = await this.requester.makeRawRequest(FeeEstimateQuery, {
      bitcoin_network: bitcoinNetwork,
    });
    return FeeEstimateFromJson(response.fee_estimate);
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

    const signingPrivateKey = await decryptSecretWithNodePassword(
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

    await this.nodeKeyCache.loadKey(nodeId, signingPrivateKeyPEM);
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
   * Directly unlocks a node with a signing private key.
   *
   * @param nodeId The ID of the node to unlock.
   * @param signingPrivateKeyPEM The PEM-encoded signing private key.
   */
  public async loadNodeKey(nodeId: string, signingPrivateKeyPEM: string) {
    await this.nodeKeyCache.loadKey(nodeId, signingPrivateKeyPEM);
  }

  /**
   * Sends a lightning payment for a given invoice.
   *
   * @param payerNodeId The ID of the node that will pay the invoice.
   * @param encodedInvoice The encoded invoice to pay.
   * @param timeoutSecs A timeout for the payment in seconds. Defaults to 60 seconds.
   * @param amount The amount to pay. Defaults to the full amount of the invoice.
   * @param maximumFees Maximum fees to pay for the payment. Defaults to no maximum.
   * @returns An `OutgoingPayment` object if the payment was successful, or undefined if the payment failed.
   */
  public async payInvoice(
    payerNodeId: string,
    encodedInvoice: string,
    timeoutSecs: number = 60,
    amount: CurrencyAmountInput | null = null,
    maximumFees: CurrencyAmountInput | null = null
  ): Promise<OutgoingPayment | undefined> {
    if (!this.nodeKeyCache.hasKey(payerNodeId)) {
      throw new LightsparkSigningException("Paying node is not unlocked");
    }
    const response = await this.requester.makeRawRequest(
      PayInvoice,
      {
        node_id: payerNodeId,
        encoded_invoice: encodedInvoice,
        timeout_secs: timeoutSecs,
        amount,
        maximum_fees: maximumFees,
      },
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
   * @param amount The amount to pay.
   * @param maximumFees The maximum amount of fees that you want to pay for this payment to be sent.
   *     Defaults to no maximum.
   * @returns An `OutgoingPayment` object if the payment was successful, or undefined if the payment failed.
   */
  public async sendPayment(
    payerNodeId: string,
    destinationPublicKey: string,
    timeoutSecs: number = 60,
    amount: CurrencyAmountInput,
    maximumFees: CurrencyAmountInput | null = null
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
        amount,
        maximum_fees: maximumFees,
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
   * Withdraws funds from a given node to a given Bitcoin address.
   *
   * @deprecated Use `requestWithdrawal` instead.
   * @param nodeId The ID of the node to withdraw funds from.
   * @param bitcoinAddress The Bitcoin address to withdraw funds to.
   * @param amount The amount of funds to withdraw.
   */
  public async withdrawFunds(
    nodeId: string,
    bitcoinAddress: string,
    amount: CurrencyAmountInput
  ): Promise<Withdrawal> {
    const response = await this.requester.makeRawRequest(
      WithdrawFunds,
      {
        node_id: nodeId,
        bitcoin_address: bitcoinAddress,
        amount,
      },
      nodeId
    );
    return WithdrawalFromJson(response.withdraw_funds.transaction);
  }

  /**
   * Withdraws funds from the account and sends it to the requested bitcoin address.
   *
   * Depending on the chosen mode, it will first take the funds from the wallet, and if applicable, close channels
   * appropriately to recover enough funds and reopen channels with the remaining funds.
   * The process is asynchronous and may take up to a few minutes. You can check the progress by polling the
   * `WithdrawalRequest` that is created, or by subscribing to a webhook.
   *
   * @param amountSats The amount of funds to withdraw in SATOSHI.
   * @param bitcoinAddress The Bitcoin address to withdraw funds to.
   * @param mode The mode to use for the withdrawal. See `WithdrawalMode` for more information.
   */
  public async requestWithdrawal(
    amountSats: number,
    bitcoinAddress: string,
    mode: WithdrawalMode
  ): Promise<WithdrawalRequest> {
    const response = await this.requester.makeRawRequest(RequestWithdrawal, {
      amount_sats: amountSats,
      bitcoin_address: bitcoinAddress,
      withdrawl_mode: mode,
    });
    return WithdrawalRequestFromJson(response.request_withdrawal.request);
  }

  /**
   * Adds funds to a Lightspark node on the REGTEST network. If the amount is not specified, 10,000,000 SATOSHI will be
   * added. This API only functions for nodes created on the REGTEST network and will return an error when called for
   * any non-REGTEST node.
   *
   * @param nodeId The ID of the node to fund. Must be a REGTEST node.
   * @param amount The amount of funds to add to the node. Defaults to 10,000,000 SATOSHI.
   * @returns
   */
  public async fundNode(
    nodeId: string,
    amount?: CurrencyAmountInput
  ): Promise<CurrencyAmount> {
    const response = await this.requester.makeRawRequest(FundNode, {
      node_id: nodeId,
      amount,
    });
    return CurrencyAmountFromJson(response.fund_node.amount);
  }

  /**
   * Creates a new API token that can be used to authenticate requests for this account when using the Lightspark APIs
   * and SDKs.
   *
   * @param name Creates a new API token that can be used to authenticate requests for this account when using the
   *     Lightspark APIs and SDKs.
   * @returns An object containing the API token and client secret.
   */
  public async createApiToken(name: string): Promise<CreateApiTokenOutput> {
    const response = await this.requester.makeRawRequest(CreateApiToken, {
      name,
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

export default LightsparkClient;
