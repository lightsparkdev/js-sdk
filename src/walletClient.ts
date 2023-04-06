// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import { Maybe } from "graphql/jsutils/Maybe.js";
import { Observable } from "zen-observable-ts";
import AuthProvider from "./auth/AuthProvider.js";
import LightsparkAuthException from "./auth/LightsparkAuthException.js";
import StubAuthProvider from "./auth/StubAuthProvider.js";
import LightsparkClient from "./client.js";
import NodeKeyCache from "./crypto/NodeKeyCache.js";
import { WalletDashboard } from "./graphql/SingleNodeDashboard.js";
import LightsparkException from "./LightsparkException.js";
import BitcoinNetwork from "./objects/BitcoinNetwork.js";
import CurrencyAmount from "./objects/CurrencyAmount.js";
import FeeEstimate from "./objects/FeeEstimate.js";
import InvoiceData from "./objects/InvoiceData.js";
import InvoiceType from "./objects/InvoiceType.js";
import OutgoingPayment from "./objects/OutgoingPayment.js";
import Transaction from "./objects/Transaction.js";
import Query from "./requester/Query.js";
import Requester from "./requester/Requester.js";

class LightsparkWalletClient {
  private fullClient: LightsparkClient;
  private readonly nodeKeyCache: NodeKeyCache = new NodeKeyCache();
  private activeWalletId: string | undefined;
  private requester: Requester;

  constructor(
    private authProvider: AuthProvider = new StubAuthProvider(),
    walletId: string | undefined = undefined,
    private readonly serverUrl: string = "api.lightspark.com"
  ) {
    this.fullClient = new LightsparkClient(
      authProvider,
      this.serverUrl,
      this.nodeKeyCache
    );
    this.requester = new Requester(this.nodeKeyCache, authProvider, serverUrl);

    this.activeWalletId = walletId;

    autoBind(this);
  }

  public async setAuthProvider(authProvider: AuthProvider) {
    this.fullClient.setAuthProvider(authProvider);
    this.requester = new Requester(
      this.nodeKeyCache,
      authProvider,
      this.serverUrl
    );
    this.authProvider = authProvider;
  }

  public async isAuthorized(): Promise<boolean> {
    return await this.authProvider.isAuthorized();
  }

  public getActiveWalletId(): string | undefined {
    return this.activeWalletId;
  }

  public async getWalletDashboard(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET,
    transactionsAfterDate: Maybe<string> = undefined
  ): Promise<WalletDashboard> {
    return this.fullClient.getSingleNodeDashboard(
      this.requireWalletId(),
      bitcoinNetwork,
      transactionsAfterDate
    );
  }

  public async getRecentTransactions(
    numTransactions: number = 20,
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET,
    afterDate: Maybe<string> = undefined
  ): Promise<Transaction[]> {
    return await this.fullClient.getRecentTransactions(
      this.requireWalletId(),
      numTransactions,
      bitcoinNetwork,
      afterDate
    );
  }

  public listenToTransactions(): Observable<Transaction | undefined> {
    return this.fullClient.listenToTransactions([this.requireWalletId()]);
  }

  public async createInvoice(
    amountMsats: number,
    memo: string,
    type: InvoiceType | undefined = undefined
  ): Promise<string | undefined> {
    return await this.fullClient.createInvoice(
      this.requireWalletId(),
      amountMsats,
      memo,
      type
    );
  }

  public async decodeInvoice(encodedInvoice: string): Promise<InvoiceData> {
    return await this.fullClient.decodeInvoice(encodedInvoice);
  }

  public async getBitcoinFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET
  ): Promise<FeeEstimate> {
    return await this.fullClient.getBitcoinFeeEstimate(bitcoinNetwork);
  }

  public setActiveWalletWithoutUnlocking(walletId: string | undefined) {
    this.activeWalletId = walletId;
  }

  public async unlockWallet(walletId: string, password: string) {
    const result = await this.fullClient.unlockNode(walletId, password);
    if (!result) {
      return false;
    }
    this.activeWalletId = walletId;
    return true;
  }

  public async loadWalletKey(signingPrivateKeyPEM: string) {
    await this.fullClient.loadNodeKey(
      this.requireWalletId(),
      signingPrivateKeyPEM
    );
  }

  public async payInvoice(
    encodedInvoice: string,
    timeoutSecs: number = 60,
    maximumFeesMsats: number,
    amountMsats: number | undefined = undefined
  ): Promise<OutgoingPayment | undefined> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new LightsparkAuthException("Wallet is not unlocked");
    }
    return await this.fullClient.payInvoice(
      walletId,
      encodedInvoice,
      timeoutSecs,
      maximumFeesMsats,
      amountMsats
    );
  }

  /**
   * Sends a payment directly to a node on the Lightning Network through the public key of the node without an invoice.
   *
   * @param destinationPublicKey The public key of the destination node.
   * @param timeoutSecs The timeout in seconds that we will try to make the payment.
   * @param amount The amount to pay
   * @param maximumFees The maximum amount of fees that you want to pay for this payment to be sent.
   *     Defaults to no maximum.
   * @returns An `OutgoingPayment` object if the payment was successful, or undefined if the payment failed.
   */
  public async sendPayment(
    destinationPublicKey: string,
    timeoutSecs: number = 60,
    amountMsats: number,
    maximumFeesMsats: number
  ): Promise<OutgoingPayment | undefined> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new LightsparkAuthException("Wallet is not unlocked");
    }
    return this.fullClient.sendPayment(
      walletId,
      destinationPublicKey,
      timeoutSecs,
      amountMsats,
      maximumFeesMsats
    );
  }

  /**
   * Creates an L1 Bitcoin wallet address for your wallet node which can be used to deposit or withdraw funds.
   *
   * @returns A string containing the wallet address for the given node.
   */
  public async createNodeWalletAddress(): Promise<string> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new LightsparkAuthException("Wallet is not unlocked");
    }
    return this.fullClient.createNodeWalletAddress(walletId);
  }

  /**
   * Adds funds to a Lightspark node on the REGTEST network. If the amount is not specified, 10,000,000 SATOSHI will be
   * added. This API only functions for nodes created on the REGTEST network and will return an error when called for
   * any non-REGTEST node.
   *
   * @param amountSats The amount of funds to add to the node. Defaults to 10,000,000 SATOSHI.
   * @returns
   */
  public async fundNode(
    amountSats: number | undefined = undefined
  ): Promise<CurrencyAmount> {
    return this.fullClient.fundNode(this.requireWalletId(), amountSats);
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
    return this.fullClient.executeRawQuery(query);
  }

  requireWalletId(): string {
    if (!this.activeWalletId) {
      throw new LightsparkException("NoWallet", "No active wallet");
    }
    return this.activeWalletId!;
  }
}

export default LightsparkWalletClient;
