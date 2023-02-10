import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
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
} from "./generated/graphql";
import { SingleNodeDashboard } from "./graphql/SingleNodeDashboard";
import { b64encode } from "./utils/base64";
import { CreateInvoice } from "./graphql/CreateInvoice";
import { DecodeInvoice } from "./graphql/DecodeInvoice";
import { FeeEstimate } from "./graphql/FeeEstimate";
import { RecoverNodeSigningKey } from "./graphql/RecoverNodeSigningKey";
import { Maybe } from "graphql/jsutils/Maybe";
import { decryptSecretWithNodePassword } from "./crypto/crypto";
import NodeKeyCache from "./crypto/NodeKeyCache";
import {
  getNewApolloClient,
  setApolloClientOptions,
} from "./apollo/apolloClient";
import { PayInvoice } from "./graphql/PayInvoice";
import { Headers } from "./apollo/constants";
import { MultiNodeDashboard } from "./graphql/MultiNodeDashboard";
import AuthProvider from "./auth/AuthProvider";
import StubAuthProvider from "./auth/StubAuthProvider";
import StreamingDemoAccountCredentials from "./auth/StreamingDemoCredentials";

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

  public async getWalletDashboard(): Promise<SingleNodeDashboardQuery> {
    const walletId = this.requireWalletId();
    const response = await this.client.query({
      query: SingleNodeDashboard,
      variables: {
        nodeId: walletId,
        network: BitcoinNetwork.Regtest,
        numTransactions: 20,
      },
    });
    return response.data;
  }

  public async getAllNodesDashboard(
    nodeIds: string[] | undefined = undefined
  ): Promise<MultiNodeDashboardQuery> {
    const response = await this.client.query<MultiNodeDashboardQuery>({
      query: MultiNodeDashboard,
      variables: {
        nodeIds: nodeIds,
        network: BitcoinNetwork.Regtest,
      },
    });
    return response.data;
  }

  public async createInvoice(
    amount: number,
    memo: string
  ): Promise<string | undefined> {
    const walletId = this.requireWalletId();
    const response = await this.client.mutate<CreateInvoiceMutation>({
      mutation: CreateInvoice,
      variables: {
        nodeId: walletId,
        amount,
        memo,
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

  public setActiveWalletWithoutUnlocking(walletId: string) {
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

    this.nodeKeyCache.loadKey(walletId, signingPrivateKeyPEM);
    this.activeWalletId = walletId;
    return true;
  }

  public async payInvoice(
    encodedInvoice: string,
    timeoutSecs: number = 60,
    amount: CurrencyAmountInput | null = null,
    maxFees: CurrencyAmountInput | null = null
  ): Promise<void> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new Error("Wallet is not unlocked");
    }
    const response = await this.client.mutate<PayInvoiceMutation>({
      mutation: PayInvoice,
      variables: {
        nodeId: walletId,
        encodedInvoice,
        timeoutSecs,
        amount,
        maxFees,
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

  public async getStreamingDemoAccountCredentials(): Promise<StreamingDemoAccountCredentials> {
    // TODO: Fill in with the real implementation when the backend is ready.
    const TEST_ACCOUNT = {
      tokenId: "0185c15936bf4f89000019ac0f816213",
      token: "pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs",
    };
    const TEST_VIEWER_WALLET_ID =
      "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599";
    const TEST_CREATOR_WALLET_ID =
      "LightsparkNode:0185c3fb-da63-f96b-0000-dde38238b1b3";
    return {
      token: TEST_ACCOUNT.token,
      tokenId: TEST_ACCOUNT.tokenId,
      creatorWalletId: TEST_CREATOR_WALLET_ID,
      viewerWalletId: TEST_VIEWER_WALLET_ID,
    };
  }

  requireWalletId(): string {
    if (!this.activeWalletId) {
      throw new Error("No active wallet");
    }
    return this.activeWalletId!;
  }
}

export { LightsparkWalletClient };
