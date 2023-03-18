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
import CurrencyAmountInput from "./objects/CurrencyAmountInput.js";
import FeeEstimate from "./objects/FeeEstimate.js";
import InvoiceData from "./objects/InvoiceData.js";
import InvoiceType from "./objects/InvoiceType.js";
import OutgoingPayment from "./objects/OutgoingPayment.js";
import Transaction from "./objects/Transaction.js";
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
    amount: CurrencyAmountInput,
    memo: string,
    type: InvoiceType | undefined = undefined
  ): Promise<string | undefined> {
    return await this.fullClient.createInvoice(
      this.requireWalletId(),
      amount,
      memo,
      type
    );
  }

  public async decodeInvoice(encodedInvoice: string): Promise<InvoiceData> {
    return await this.fullClient.decodeInvoice(encodedInvoice);
  }

  public async getFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.MAINNET
  ): Promise<FeeEstimate> {
    return await this.fullClient.getFeeEstimate(bitcoinNetwork);
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
    amount: CurrencyAmountInput | null = null,
    maximumFees: CurrencyAmountInput | null = null
  ): Promise<OutgoingPayment | undefined> {
    const walletId = this.requireWalletId();
    if (!this.nodeKeyCache.hasKey(walletId)) {
      throw new LightsparkAuthException("Wallet is not unlocked");
    }
    return await this.fullClient.payInvoice(
      walletId,
      encodedInvoice,
      timeoutSecs,
      amount,
      maximumFees
    );
  }

  requireWalletId(): string {
    if (!this.activeWalletId) {
      throw new LightsparkException("NoWallet", "No active wallet");
    }
    return this.activeWalletId!;
  }
}

export default LightsparkWalletClient;
