import { ApolloClient } from "@apollo/client/core/index.js";
import autoBind from "auto-bind";
import {
  BitcoinNetwork,
  CreateInvoiceMutation,
  CurrencyAmount,
  CurrencyAmountInput,
  DecodeInvoiceQuery,
  FeeEstimateQuery,
  InvoiceData,
  MultiNodeDashboardQuery,
  PayInvoiceMutation,
  RecoverNodeSigningKeyQuery,
  SingleNodeDashboardQuery,
  TransactionDetailsFragment,
  TransactionsForNodeQuery,
} from "./generated/graphql.js";
import { SingleNodeDashboard } from "./graphql/SingleNodeDashboard.js";
import { b64encode } from "./utils/base64.js";
import { CreateInvoice } from "./graphql/CreateInvoice.js";
import { DecodeInvoice } from "./graphql/DecodeInvoice.js";
import { FeeEstimate } from "./graphql/FeeEstimate.js";
import { RecoverNodeSigningKey } from "./graphql/RecoverNodeSigningKey.js";
import { Maybe } from "graphql/jsutils/Maybe.js";
import { decryptSecretWithNodePassword } from "./crypto/crypto.js";
import NodeKeyCache from "./crypto/NodeKeyCache.js";
import {
  getNewApolloClient,
  setApolloClientOptions,
} from "./apollo/apolloClient.js";
import { PayInvoice } from "./graphql/PayInvoice.js";
import { Headers } from "./apollo/constants.js";
import { MultiNodeDashboard } from "./graphql/MultiNodeDashboard.js";
import AuthProvider from "./auth/AuthProvider.js";
import StubAuthProvider from "./auth/StubAuthProvider.js";
import { TransactionsForNode } from "./graphql/TransactionsForNode.js";
import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types.js";

class LightsparkWalletClient {
  private client: ApolloClient<NormalizedCacheObject>;
  private nodeKeyCache: NodeKeyCache = new NodeKeyCache();
  private activeWalletId: string | undefined;

  constructor(
    private authProvider: AuthProvider = new StubAuthProvider(),
    walletId: string | undefined = undefined,
    private readonly serverUrl: string = "https://api.dev.dev.sparkinfra.net"
  ) {
    this.client = getNewApolloClient(
      serverUrl,
      this.nodeKeyCache,
      authProvider
    );
    this.activeWalletId = walletId;

    autoBind(this);
  }

  public async setAuthProvider(authProvider: AuthProvider) {
    setApolloClientOptions(
      this.client,
      this.serverUrl,
      this.nodeKeyCache,
      authProvider
    );
    this.authProvider = authProvider;
  }

  public async isAuthorized(): Promise<boolean> {
    return this.authProvider.isAuthorized();
  }

  public getActiveWalletId(): string | undefined {
    return this.activeWalletId;
  }

  public async getWalletDashboard(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.Mainnet,
    transactionsAfterDate: Maybe<string> = undefined,
    skipCache: boolean = false,
  ): Promise<SingleNodeDashboardQuery> {
    const walletId = this.requireWalletId();
    const response = await this.client.query({
      query: SingleNodeDashboard,
      variables: {
        nodeId: walletId,
        network: bitcoinNetwork,
        numTransactions: 20,
        transactionsAfterDate,
      },
      fetchPolicy: skipCache ? "no-cache" : "cache-first",
    });
    return response.data;
  }

  public async getRecentTransactions(
    numTransactions: number = 20,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.Mainnet,
    skipCache: boolean = false,
    afterDate: Maybe<string> = undefined
  ): Promise<TransactionDetailsFragment[]> {
    const walletId = this.requireWalletId();
    const response = await this.client.query<TransactionsForNodeQuery>({
      query: TransactionsForNode,
      variables: {
        nodeId: walletId,
        network: bitcoinNetwork,
        numTransactions,
        afterDate
      },
      fetchPolicy: skipCache ? "no-cache" : "cache-first",
    });
    return response.data?.current_account?.recent_transactions.edges.map((transaction) => transaction.entity) ?? [];
  }

  public async getAllNodesDashboard(
    nodeIds: string[] | undefined = undefined,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.Mainnet,
    skipCache: boolean = false
  ): Promise<MultiNodeDashboardQuery> {
    const response = await this.client.query<MultiNodeDashboardQuery>({
      query: MultiNodeDashboard,
      variables: {
        nodeIds: nodeIds,
        network: bitcoinNetwork,
      },
      fetchPolicy: skipCache ? "no-cache" : "cache-first",
    });
    return response.data;
  }

  public async createInvoice(
    amount: CurrencyAmountInput,
    memo: string,
    type: string | undefined = undefined
  ): Promise<string | undefined> {
    const walletId = this.requireWalletId();
    const response = await this.client.mutate<CreateInvoiceMutation>({
      mutation: CreateInvoice,
      variables: {
        nodeId: walletId,
        amount,
        memo,
        type,
      },
    });
    return response.data?.create_invoice?.invoice.data?.encoded_payment_request;
  }

  public async decodeInvoice(encodedInvoice: string): Promise<InvoiceData> {
    const response = await this.client.query<DecodeInvoiceQuery>({
      query: DecodeInvoice,
      variables: {
        encodedInvoice,
      },
    });
    return response.data.decoded_payment_request;
  }

  public async getFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.Mainnet
  ): Promise<{ fee_min: CurrencyAmount; fee_fast: CurrencyAmount }> {
    const response = await this.client.query<FeeEstimateQuery>({
      query: FeeEstimate,
      variables: {
        network: bitcoinNetwork,
      },
    });
    return response.data.fee_estimate;
  }

  async recoverNodeSigningKey(
    nodeId: string
  ): Promise<Maybe<{ encrypted_value: string; cipher: string }>> {
    const response = await this.client.query<RecoverNodeSigningKeyQuery>({
      query: RecoverNodeSigningKey,
      variables: {
        nodeId,
      },
    });
    const nodeEntity = response.data.entity;
    if (nodeEntity?.__typename === "LightsparkNode") {
      return nodeEntity.encrypted_signing_private_key;
    }
    return null;
  }

  public setActiveWalletWithoutUnlocking(walletId: string | undefined) {
    this.activeWalletId = walletId;
  }

  public async unlockWallet(walletId: string, password: string) {
    const encryptedKey = await this.recoverNodeSigningKey(walletId);
    if (!encryptedKey) {
      return false;
    }

    const signingPrivateKey = await decryptSecretWithNodePassword(
      encryptedKey.cipher,
      encryptedKey.encrypted_value,
      password
    );

    if (!signingPrivateKey) {
      throw new Error(
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

    await this.nodeKeyCache.loadKey(walletId, signingPrivateKeyPEM);
    this.activeWalletId = walletId;
    return true;
  }

  public async loadWalletKey(signingPrivateKeyPEM: string) {
    await this.nodeKeyCache.loadKey(
      this.requireWalletId(),
      signingPrivateKeyPEM
    );
  }

  public async payInvoice(
    encodedInvoice: string,
    timeoutSecs: number = 60,
    amount: CurrencyAmountInput | null = null,
    maximumFees: CurrencyAmountInput | null = null
  ): Promise<void> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new Error("Wallet is not unlocked");
    }
    const response = await this.client.mutate<PayInvoiceMutation>({
      mutation: PayInvoice,
      variables: {
        node_id: walletId,
        encoded_invoice: encodedInvoice,
        timeout_secs: timeoutSecs,
        amount,
        maximum_fees: maximumFees,
      },
      context: {
        headers: {
          [Headers.SigningNodeId]: walletId,
        },
      },
    });
    if (response.data?.pay_invoice?.payment.outgoing_payment_failure_message) {
      throw new Error(
        response.data?.pay_invoice?.payment.outgoing_payment_failure_message.rich_text_text
      );
    }
  }

  requireWalletId(): string {
    if (!this.activeWalletId) {
      throw new Error("No active wallet");
    }
    return this.activeWalletId!;
  }
}

export { LightsparkWalletClient };
