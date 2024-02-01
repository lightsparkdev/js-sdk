// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type {
  AuthProvider,
  CryptoInterface,
  KeyOrAliasType,
  Query,
} from "@lightsparkdev/core";
import {
  DefaultCrypto,
  LightsparkAuthException,
  LightsparkException,
  NodeKeyCache,
  Requester,
  SigningKeyType,
  StubAuthProvider,
  pollUntil,
} from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type { Observable, Subscription } from "zen-observable-ts";
import packageJson from "../package.json";
import type AccessTokenStorage from "./auth/jwt/AccessTokenStorage.js";
import CustomJwtAuthProvider from "./auth/jwt/CustomJwtAuthProvider.js";
import BitcoinFeeEstimateQuery from "./graqhql/BitcoinFeeEstimate.js";
import { CancelInvoice } from "./graqhql/CancelInvoice.js";
import CreateBitcoinFundingAddress from "./graqhql/CreateBitcoinFundingAddress.js";
import CreateInvoice from "./graqhql/CreateInvoice.js";
import CreateTestModeInvoice from "./graqhql/CreateTestModeInvoice.js";
import CreateTestModePayment from "./graqhql/CreateTestModePayment.js";
import CurrentWalletQuery from "./graqhql/CurrentWallet.js";
import DecodeInvoiceQuery from "./graqhql/DecodeInvoice.js";
import DeployWallet from "./graqhql/DeployWallet.js";
import InitializeWallet from "./graqhql/InitializeWallet.js";
import LightningFeeEstimateForInvoice from "./graqhql/LightningFeeEstimateForInvoice.js";
import LightningFeeEstimateForNode from "./graqhql/LightningFeeEstimateForNode.js";
import LoginWithJWT from "./graqhql/LoginWithJWT.js";
import PayInvoiceMutation from "./graqhql/PayInvoice.js";
import RequestWithdrawalMutation from "./graqhql/RequestWithdrawal.js";
import SendPaymentMutation from "./graqhql/SendPayment.js";
import TerminateWallet from "./graqhql/TerminateWallet.js";
import WalletDashboardQuery from "./graqhql/WalletDashboard.js";
import { WithdrawalFeeEstimate } from "./graqhql/WithdrawalFeeEstimate.js";
import { logger } from "./logger.js";
import { BalancesFromJson } from "./objects/Balances.js";
import type CurrencyAmount from "./objects/CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./objects/CurrencyAmount.js";
import { DeployWalletOutputFromJson } from "./objects/DeployWalletOutput.js";
import type FeeEstimate from "./objects/FeeEstimate.js";
import { FeeEstimateFromJson } from "./objects/FeeEstimate.js";
import type IncomingPayment from "./objects/IncomingPayment.js";
import {
  FRAGMENT as IncomingPaymentFragment,
  IncomingPaymentFromJson,
} from "./objects/IncomingPayment.js";
import { InitializeWalletOutputFromJson } from "./objects/InitializeWalletOutput.js";
import { InvoiceFromJson } from "./objects/Invoice.js";
import { InvoiceDataFromJson } from "./objects/InvoiceData.js";
import InvoiceType from "./objects/InvoiceType.js";
import type KeyType from "./objects/KeyType.js";
import { LoginWithJWTOutputFromJson } from "./objects/LoginWithJWTOutput.js";
import type OutgoingPayment from "./objects/OutgoingPayment.js";
import {
  FRAGMENT as OutgoingPaymentFragment,
  OutgoingPaymentFromJson,
} from "./objects/OutgoingPayment.js";
import { TerminateWalletOutputFromJson } from "./objects/TerminateWalletOutput.js";
import TransactionStatus from "./objects/TransactionStatus.js";
import { WalletFromJson } from "./objects/Wallet.js";
import type WalletDashboard from "./objects/WalletDashboard.js";
import WalletStatus from "./objects/WalletStatus.js";
import { WalletToPaymentRequestsConnectionFromJson } from "./objects/WalletToPaymentRequestsConnection.js";
import { WalletToTransactionsConnectionFromJson } from "./objects/WalletToTransactionsConnection.js";
import type WithdrawalFeeEstimateOutput from "./objects/WithdrawalFeeEstimateOutput.js";
import { WithdrawalFeeEstimateOutputFromJson } from "./objects/WithdrawalFeeEstimateOutput.js";
import type WithdrawalMode from "./objects/WithdrawalMode.js";
import type WithdrawalRequest from "./objects/WithdrawalRequest.js";
import { WithdrawalRequestFromJson } from "./objects/WithdrawalRequest.js";

function isOutgoingPayment(payment: unknown): payment is OutgoingPayment {
  return Boolean(
    payment &&
      typeof payment === "object" &&
      "typename" in payment &&
      payment.typename === "OutgoingPayment",
  );
}

const sdkVersion = packageJson.version;

/**
 * The LightsparkClient is the main entrypoint for interacting with the
 * Lightspark Wallet SDK.
 *
 * ```ts
 * const lightsparkClient = new LightsparkClient(
 *    new CustomJwtAuthProvider(new InMemoryTokenStorage()),
 * );
 * const encodedInvoice = await lightsparkClient.createInvoice(
 *   { value: 100, unit: CurrencyUnit.SATOSHI },
 *   "Whasssupppp",
 *   InvoiceType.AMP,
 * );
 *
 * const invoiceDetails = await lightsparkClient.decodeInvoice(encodedInvoice);
 * console.log(invoiceDetails);
 *
 * const payment = await lightsparkClient.payInvoice(encodedInvoice, 1_000_000);
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
   *     For React Native, you should use the `ReactNativeCrypto`
   *     implementation from `@lightsparkdev/react-native`.
   * @param signingKeyType The type of signing key used in the LightsparkClient. Different signing operations are used depending on the key type.
   */
  constructor(
    private authProvider: AuthProvider = new StubAuthProvider(),
    private readonly serverUrl: string = "api.lightspark.com",
    private readonly cryptoImpl: CryptoInterface = DefaultCrypto,
    private readonly signingKeyType: SigningKeyType = SigningKeyType.RSASigningKey,
  ) {
    this.nodeKeyCache = new NodeKeyCache(this.cryptoImpl);
    this.requester = new Requester(
      this.nodeKeyCache,
      WALLET_SDK_ENDPOINT,
      `js-wallet-sdk/${sdkVersion}`,
      authProvider,
      serverUrl,
      this.cryptoImpl,
    );

    autoBind(this);
  }

  /**
   * Sets the auth provider for the client.
   * This is useful for switching between auth providers if you are using
   * multiple accounts or waiting for the user to log in.
   *
   * @param authProvider
   */
  public setAuthProvider(authProvider: AuthProvider) {
    this.requester = new Requester(
      this.nodeKeyCache,
      WALLET_SDK_ENDPOINT,
      `js-wallet-sdk/${sdkVersion}`,
      authProvider,
      this.serverUrl,
      this.cryptoImpl,
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
   * Login using the Custom JWT authentication scheme described in our
   * documentation.
   *
   * Note: When using this method, you are responsible for refreshing the JWT
   * token before or when it expires. If the token expires,
   * the client will throw a [LightsparkAuthenticationException] on the next
   * API call which requires valid authentication.
   * Then you'll need to call this method again to get a new token.
   *
   * @param accountId The account ID to login with. This is specific to your company's account.
   * @param jwt The JWT to use for authentication of this user.
   * @param storage The storage to use for storing the JWT token.
   * @return The output of the login operation, including the access token, expiration time, and wallet info.
   */
  public async loginWithJWT(
    accountId: string,
    jwt: string,
    storage: AccessTokenStorage,
  ) {
    const response = await this.executeRawQuery({
      queryPayload: LoginWithJWT,
      variables: {
        account_id: accountId,
        jwt,
      },
      constructObject: (responseJson: any) => {
        return LoginWithJWTOutputFromJson(responseJson.login_with_jwt);
      },
      skipAuth: true,
    });

    if (!response) {
      throw new LightsparkAuthException(
        "Login failed. Please check your credentials and try again.",
      );
    }

    const authProvider = new CustomJwtAuthProvider(storage);
    await authProvider.setTokenInfo({
      accessToken: response.accessToken,
      validUntil: new Date(response.validUntil),
    });
    this.setAuthProvider(authProvider);

    return response;
  }

  /**
   * Deploys a wallet in the Lightspark infrastructure.
   * This is an asynchronous operation,
   * the caller should then poll the wallet frequently (or subscribe to its
   * modifications). When this process is over,
   * the Wallet status will change to `DEPLOYED` (or `FAILED`).
   *
   * @return The wallet that was deployed.
   */
  public async deployWallet() {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: DeployWallet,
      constructObject: (responseJson: any) => {
        return DeployWalletOutputFromJson(responseJson.deploy_wallet).wallet;
      },
    });
  }

  /**
   * Deploys a wallet in the Lightspark infrastructure and waits for it to be
   * deployed. This is an asynchronous operation,
   * which will continue processing wallet status updates until the Wallet
   * status changes to `DEPLOYED` (or `FAILED`).
   *
   * @return A Promise with the final wallet status after deployment or failure.
   * @throws LightsparkException if the wallet status is not `DEPLOYED` or `FAILED` after 60 seconds,
   * or if the subscription fails.
   */
  public async deployWalletAndAwaitDeployed() {
    const wallet = await this.deployWallet();
    if (
      wallet?.status === WalletStatus.DEPLOYED ||
      wallet?.status === WalletStatus.FAILED
    ) {
      return wallet.status;
    }
    return await this.waitForWalletStatus([
      WalletStatus.DEPLOYED,
      WalletStatus.FAILED,
    ]);
  }

  /**
   * Initializes a wallet in the Lightspark infrastructure and syncs it to the
   * Bitcoin network. This is an asynchronous operation,
   * the caller should then poll the wallet frequently (or subscribe to its
   * modifications). When this process is over,
   * the Wallet status will change to `READY` (or `FAILED`).
   *
   * @param keyType The type of key to use for the wallet.
   * @param signingPublicKey The base64-encoded public key to use for signing transactions.
   * @param signingPrivateKeyOrAlias An object containing either the base64-encoded private key or, in the case of
   *     React Native, a key alias for a key in the mobile keystore.
   *     The key will be used for signing transactions.
   *     This key will not leave the device.
   *     It is only used for signing transactions locally.
   * @return The wallet that was initialized.
   */
  public async initializeWallet(
    keyType: KeyType,
    signingPublicKey: string,
    signingPrivateKeyOrAlias: KeyOrAliasType,
  ) {
    await this.requireValidAuth();
    await this.loadWalletSigningKey(signingPrivateKeyOrAlias);
    return await this.executeRawQuery({
      queryPayload: InitializeWallet,
      variables: {
        key_type: keyType,
        signing_public_key: signingPublicKey,
      },
      signingNodeId: WALLET_NODE_ID_KEY,
      constructObject: (responseJson: any) => {
        return InitializeWalletOutputFromJson(responseJson.initialize_wallet)
          .wallet;
      },
    });
  }

  /**
   * Initializes a wallet in the Lightspark infrastructure and syncs it to the
   * Bitcoin network. This is an asynchronous operation,
   * which will continue processing wallet status updates until the Wallet
   * status changes to `READY` (or `FAILED`).
   *
   * @param keyType The type of key to use for the wallet.
   * @param signingPublicKey The base64-encoded public key to use for signing transactions.
   * @param signingPrivateKeyOrAlias An object containing either the base64-encoded private key or, in the case of
   *     React Native, a key alias for a key in the mobile keystore.
   *     The key will be used for signing transactions.
   *     This key will not leave the device.
   *     It is only used for signing transactions locally.
   * @return A Promise with the final wallet status after initialization or failure.
   * @throws LightsparkException if the wallet status is not `READY` or `FAILED` after 5 minutes,
   * or if the subscription fails.
   */
  public async initializeWalletAndAwaitReady(
    keyType: KeyType,
    signingPublicKey: string,
    signingPrivateKeyOrAlias: KeyOrAliasType,
  ) {
    const wallet = await this.initializeWallet(
      keyType,
      signingPublicKey,
      signingPrivateKeyOrAlias,
    );
    if (
      wallet?.status === WalletStatus.READY ||
      wallet?.status === WalletStatus.FAILED
    ) {
      return wallet.status;
    }
    return await this.waitForWalletStatus(
      [WalletStatus.READY, WalletStatus.FAILED],
      300,
    );
  }

  /**
   * Removes the wallet from Lightspark infrastructure.
   * It won't be connected to the Lightning network anymore and its funds won't
   * be accessible outside of the Funds Recovery Kit process.
   *
   * @return The wallet that was terminated.
   */
  public async terminateWallet() {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: TerminateWallet,
      constructObject: (responseJson: any) => {
        return TerminateWalletOutputFromJson(responseJson.terminate_wallet)
          .wallet;
      },
    });
  }

  /**
   * Get the dashboard overview for a Lightning wallet.
   * Includes balance info and the most recent transactions and payment
   * requests.
   *
   * @param numTransactions The max number of recent transactions to fetch. Defaults to 20.
   * @param numPaymentRequests The max number of recent payment requests to fetch. Defaults to 20.
   * @return The dashboard overview for the wallet, including balance and recent transactions and payment requests.
   */
  public async getWalletDashboard(
    numTransactions: number = 20,
    numPaymentRequests: number = 20,
  ) {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: WalletDashboardQuery,
      variables: {
        numTransactions,
        numPaymentRequests,
      },
      constructObject: (responseJson: any): WalletDashboard | null => {
        const currentWallet = responseJson.current_wallet;
        if (!currentWallet) {
          return null;
        }
        return {
          id: currentWallet.id,
          status: currentWallet.status as WalletStatus,
          balances:
            currentWallet.balances && BalancesFromJson(currentWallet.balances),
          recentTransactions:
            currentWallet.recent_transactions &&
            WalletToTransactionsConnectionFromJson(
              currentWallet.recent_transactions,
            ),
          paymentRequests:
            currentWallet.payment_requests &&
            WalletToPaymentRequestsConnectionFromJson(
              currentWallet.payment_requests,
            ),
        };
      },
    });
  }

  /**
   * Creates a lightning invoice from the current wallet.
   *
   * Test mode note: You can simulate a payment of this invoice in test move
   * using [createTestModePayment].
   *
   * @param amountMsats The amount of the invoice in milli-satoshis.
   * @param memo Optional memo to include in the invoice.
   * @param type The type of invoice to create. Defaults to [InvoiceType.STANDARD].
   * @param expirySecs The number of seconds until the invoice expires. Defaults to 1 day.
   * @return The created invoice.
   */
  public async createInvoice(
    amountMsats: number,
    memo: string | undefined = undefined,
    type: InvoiceType = InvoiceType.STANDARD,
    expirySecs: number | undefined = undefined,
  ) {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: CreateInvoice,
      variables: {
        amountMsats,
        memo,
        type,
        expirySecs,
      },
      constructObject: (responseJson: any) => {
        return InvoiceFromJson(responseJson.create_invoice.invoice);
      },
    });
  }

  /**
   * Cancels an existing unpaid invoice and returns that invoice. Cancelled invoices cannot be paid.
   *
   * @param invoiceId The ID of the invoice to cancel.
   * @returns The cancelled invoice, or undefined if the invoice could not be cancelled.
   */
  public async cancelInvoice(invoiceId: string) {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: CancelInvoice,
      variables: {
        invoice_id: invoiceId,
      },
      constructObject: (responseJson: any) => {
        return InvoiceFromJson(responseJson.cancel_invoice.invoice);
      },
    });
  }

  /**
   * Pay a lightning invoice from the current wallet.
   * This function will return immediately with the payment details,
   * which may still be in a PENDING state.
   * You can use the [payInvoiceAndAwaitResult] function to wait for the
   * payment to complete or fail.
   *
   * Note: This call will fail if the wallet is not unlocked yet via
   * [loadWalletSigningKey]. You must successfully unlock the wallet before
   * calling this function.
   *
   * Test mode note: For test mode, you can use the [createTestModeInvoice]
   * function to create an invoice you can pay in test mode.
   *
   * @param encodedInvoice An encoded string representation of the invoice to pay.
   * @param maxFeesMsats The maximum fees to pay in milli-satoshis. You must pass a value.
   *     As guidance, a maximum fee of 15 basis points should make almost all
   *     transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats,
   *     this would mean a fee limit of 15 to 150 sats.
   * @param amountMsats The amount to pay in milli-satoshis. Defaults to the full amount of the invoice.
   * @param timeoutSecs The number of seconds to wait for the payment to complete. Defaults to 60.
   * @return The payment details, which may still be in a PENDING state. You can use the [payInvoiceAndAwaitResult]
   *     function to wait for the payment to complete or fail.
   */
  public async payInvoice(
    encodedInvoice: string,
    maxFeesMsats: number,
    amountMsats: number | undefined = undefined,
    timoutSecs: number = 60,
  ) {
    await this.requireValidAuth();
    this.requireWalletUnlocked();
    const variables: any = {
      encoded_invoice: encodedInvoice,
      maximum_fees_msats: maxFeesMsats,
      timeout_secs: timoutSecs,
    };
    if (amountMsats !== undefined) {
      variables.amount_msats = amountMsats;
    }
    const payment = await this.executeRawQuery({
      queryPayload: PayInvoiceMutation,
      variables,
      constructObject: (responseJson: any) => {
        return OutgoingPaymentFromJson(responseJson.pay_invoice.payment);
      },
      signingNodeId: WALLET_NODE_ID_KEY,
    });
    if (!payment) {
      throw new LightsparkException(
        "PaymentNullError",
        "Unknown error paying invoice",
      );
    }
    return payment;
  }

  /**
   * Pay a lightning invoice from the current wallet and wait for the payment
   * to complete or fail.
   *
   * Note: This call will fail if the wallet is not unlocked yet via
   * [loadWalletSigningKey]. You must successfully unlock the wallet before
   * calling this function.
   *
   * @param encodedInvoice An encoded string representation of the invoice to pay.
   * @param maxFeesMsats The maximum fees to pay in milli-satoshis. You must pass a value.
   *     As guidance, a maximum fee of 15 basis points should make almost all
   *     transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats,
   *     this would mean a fee limit of 15 to 150 sats.
   * @param amountMsats The amount to pay in milli-satoshis. Defaults to the full amount of the invoice.
   * @param timeoutSecs The number of seconds to wait for the payment to complete. Defaults to 60.
   * @return The payment details.
   */
  public async payInvoiceAndAwaitResult(
    encodedInvoice: string,
    maxFeesMsats: number,
    amountMsats: number | undefined = undefined,
    timeoutSecs: number = 60,
  ) {
    logger.trace(`payInvoiceAndAwaitResult params`, {
      encodedInvoice,
      maxFeesMsats,
      amountMsats,
      timeoutSecs,
    });
    const payment = await this.payInvoice(
      encodedInvoice,
      maxFeesMsats,
      amountMsats,
      timeoutSecs,
    );
    logger.trace(`payInvoiceAndAwaitResult payment`, {
      paymentId: payment.id,
      paymentStatus: payment.status,
    });
    const paymentResult = await this.awaitPaymentResult(payment, timeoutSecs);
    return paymentResult;
  }

  public async awaitPaymentResult<T extends OutgoingPayment | IncomingPayment>(
    payment: T,
    timeoutSecs: number = 60,
  ): Promise<T> {
    logger.trace(`awaitPaymentResult payment`, {
      paymentId: payment.id,
      paymentStatus: payment.status,
    });
    const completionStatuses = [
      TransactionStatus.FAILED,
      TransactionStatus.CANCELLED,
      TransactionStatus.SUCCESS,
    ];
    logger.trace(`awaitPaymentResult payment.status`, payment.status);
    if (completionStatuses.includes(payment.status)) {
      return Promise.resolve(payment);
    }

    const timeoutError = new LightsparkException(
      "PaymentStatusAwaitError",
      `Timed out waiting for payment status to be one of ${completionStatuses.join(
        ", ",
      )}.`,
    );

    const pollIntervalMs = 500;
    const ignoreErrors = false;

    const isOutgoing = isOutgoingPayment(payment);
    const paymentResult: T = await pollUntil(
      () => {
        return this.executeRawQuery({
          queryPayload: `
          query ${isOutgoing ? "Outgoing" : "Incoming"}PaymentStatusQuery {
            entity(id: "${payment.id}") {
              ...${
                isOutgoing
                  ? "OutgoingPaymentFragment"
                  : "IncomingPaymentFragment"
              }
            }
          }
          ${isOutgoing ? OutgoingPaymentFragment : IncomingPaymentFragment}
        `,
          constructObject: (responseJson: any) => {
            return isOutgoing
              ? OutgoingPaymentFromJson(responseJson.entity)
              : IncomingPaymentFromJson(responseJson.entity);
          },
        });
      },
      (current, response) => {
        logger.trace(`pollUntil current`, current);
        if (current && completionStatuses.includes(current.status)) {
          return {
            stopPolling: true,
            value: current as T,
          };
        }
        return response;
      },
      (timeoutSecs * 1000) / pollIntervalMs,
      pollIntervalMs,
      ignoreErrors,
      () => timeoutError,
    );

    return paymentResult;
  }

  /**
   * Sends a payment directly to a node on the Lightning Network through the
   * public key of the node without an invoice.
   * This function will return immediately with the payment details,
   * which may still be in a PENDING state.
   * You can use the [sendPaymentAndAwaitResult] function to wait for the
   * payment to complete or fail.
   *
   * @param destinationPublicKey The public key of the destination node.
   * @param amountMsats The amount to pay in milli-satoshis.
   * @param maxFeesMsats The maximum amount of fees that you want to pay for this payment to be sent.
   *     As guidance, a maximum fee of 15 basis points should make almost all
   *     transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats,
   *     this would mean a fee limit of 15 to 150 sats.
   * @param timeoutSecs The timeout in seconds that we will try to make the payment.
   * @return An `OutgoingPayment` object, which may still be in a PENDING state. You can use the
   *     [sendPaymentAndAwaitResult] function to wait for the payment to
   *     complete or fail.
   */
  public async sendPayment(
    destinationNodePublicKey: string,
    amountMsats: number,
    maxFeesMsats: number,
    timeoutSecs: number = 60,
  ) {
    await this.requireValidAuth();
    this.requireWalletUnlocked();
    const payment = await this.executeRawQuery({
      queryPayload: SendPaymentMutation,
      variables: {
        destination_node_public_key: destinationNodePublicKey,
        amount_msats: amountMsats,
        maximum_fees_msats: maxFeesMsats,
        timeout_secs: timeoutSecs,
      },
      constructObject: (responseJson: any) => {
        return OutgoingPaymentFromJson(responseJson.send_payment.payment);
      },
      signingNodeId: WALLET_NODE_ID_KEY,
    });
    if (!payment) {
      throw new LightsparkException(
        "PaymentNullError",
        "Unknown error sending payment",
      );
    }
    return payment;
  }

  /**
   * Sends a payment directly to a node on the Lightning Network through the
   * public key of the node without an invoice.
   * Waits for the payment to complete or fail.
   *
   * @param destinationPublicKey The public key of the destination node.
   * @param amountMsats The amount to pay in milli-satoshis.
   * @param maxFeesMsats The maximum amount of fees that you want to pay for this payment to be sent.
   *     As guidance, a maximum fee of 15 basis points should make almost all
   *     transactions succeed. For example,
   *     for a transaction between 10k sats and 100k sats,
   *     this would mean a fee limit of 15 to 150 sats.
   * @param timeoutSecs The timeout in seconds that we will try to make the payment.
   * @return An `OutgoingPayment` object. Check the `status` field to see if the payment succeeded or failed.
   */
  public async sendPaymentAndAwaitResult(
    destinationNodePublicKey: string,
    amountMsats: number,
    maxFeesMsats: number,
    timeoutSecs: number = 60,
  ) {
    const payment = await this.sendPayment(
      destinationNodePublicKey,
      amountMsats,
      maxFeesMsats,
      timeoutSecs,
    );
    return await this.awaitPaymentResult(payment, timeoutSecs);
  }

  /**
   * Decode a lightning invoice to get its details included payment amount,
   * destination, etc.
   *
   * @param encodedInvoice An encoded string representation of the invoice to decode.
   * @return The decoded invoice details.
   */
  public async decodeInvoice(encodedInvoice: string) {
    return await this.executeRawQuery({
      queryPayload: DecodeInvoiceQuery,
      variables: {
        encoded_payment_request: encodedInvoice,
      },
      constructObject: (responseJson: any) => {
        return InvoiceDataFromJson(responseJson.decoded_payment_request);
      },
    });
  }

  /**
   * Gets an estimate of the fee for sending a payment over the given bitcoin
   * network.
   *
   * @param bitcoinNetwork The bitcoin network for which to get a fee estimate. Defaults to MAINNET.
   * @returns A fee estimate for the given bitcoin network including a minimum fee rate, and a max-speed fee rate.
   */
  public async getBitcoinFeeEstimate(): Promise<FeeEstimate> {
    const response = await this.requester.makeRawRequest(
      BitcoinFeeEstimateQuery,
    );
    return FeeEstimateFromJson(response.bitcoin_fee_estimate);
  }

  /**
   * Gets an estimate of the fees that will be paid for a Lightning invoice.
   *
   * @param encodedPaymentRequest The invoice you want to pay (as defined by the BOLT11 standard).
   * @param amountMsats If the invoice does not specify a payment amount, then the amount that you wish to pay,
   *     expressed in msats.
   * @returns An estimate of the fees that will be paid for a Lightning invoice.
   */
  public async getLightningFeeEstimateForInvoice(
    encodedPaymentRequest: string,
    amountMsats: number | undefined = undefined,
  ): Promise<CurrencyAmount> {
    await this.requireValidAuth();
    const response = await this.requester.makeRawRequest(
      LightningFeeEstimateForInvoice,
      {
        encoded_payment_request: encodedPaymentRequest,
        amount_msats: amountMsats,
      },
    );
    return CurrencyAmountFromJson(
      response.lightning_fee_estimate_for_invoice
        .lightning_fee_estimate_output_fee_estimate,
    );
  }

  /**
   * Returns an estimate of the fees that will be paid to send a payment to
   * another Lightning node.
   *
   * @param destinationNodePublicKey The public key of the node that you want to pay.
   * @param amountMsats The payment amount expressed in msats.
   * @returns An estimate of the fees that will be paid to send a payment to another Lightning node.
   */
  public async getLightningFeeEstimateForNode(
    destinationNodePublicKey: string,
    amountMsats: number,
  ): Promise<CurrencyAmount> {
    await this.requireValidAuth();
    const response = await this.requester.makeRawRequest(
      LightningFeeEstimateForNode,
      {
        destination_node_public_key: destinationNodePublicKey,
        amount_msats: amountMsats,
      },
    );
    return CurrencyAmountFromJson(
      response.lightning_fee_estimate_for_node
        .lightning_fee_estimate_output_fee_estimate,
    );
  }

  /**
   * Returns an estimated amount for the L1 withdrawal fees for the specified node, amount, and
   * strategy.
   *
   * @param amountSats The amount you want to withdraw from this node in Satoshis. Use the special value -1 to
   *     withdrawal all funds from this wallet.
   * @param withdrawalMode The strategy that should be used to withdraw the funds from this node.
   * @returns An estimated amount for the L1 withdrawal fees for the specified node, amount, and strategy.
   */
  public async getWithrawalFeeEstimate(
    amountSats: number,
    withdrawalMode: WithdrawalMode,
  ): Promise<CurrencyAmount> {
    const response: WithdrawalFeeEstimateOutput | null =
      await this.executeRawQuery({
        queryPayload: WithdrawalFeeEstimate,
        variables: {
          amount_sats: amountSats,
          withdrawal_mode: withdrawalMode,
        },
        constructObject: (response: {
          withdrawal_fee_estimate: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        }) => {
          return WithdrawalFeeEstimateOutputFromJson(
            response.withdrawal_fee_estimate,
          );
        },
      });

    if (!response) {
      throw new LightsparkException(
        "WithdrawalFeeEstimateError",
        "Null or invalid fee estimate response from server",
      );
    }

    return response.feeEstimate;
  }

  /**
   * Unlocks the wallet for use with the SDK for the current application
   * session. This function must be called before any other functions that
   * require wallet signing keys, including [payInvoice].
   *
   * This function is intended for use in cases where the wallet's private
   * signing key is already saved by the application outside of the SDK.
   * It is the responsibility of the application to ensure that the key is
   * valid and that it is the correct key for the wallet.
   * Otherwise signed requests will fail.
   *
   * @param signingKeyBytesOrAlias An object holding either the PEM encoded bytes of the wallet's private signing key or,
   *     in the case of ReactNative, the alias of the key in the mobile
   *     keychain.
   */
  public loadWalletSigningKey(signingKeyBytesOrAlias: KeyOrAliasType) {
    return this.nodeKeyCache.loadKey(
      WALLET_NODE_ID_KEY,
      signingKeyBytesOrAlias,
      SigningKeyType.RSASigningKey,
    );
  }

  /**
   * Creates an L1 Bitcoin wallet address which can be used to deposit or
   * withdraw funds from the Lightning wallet.
   *
   * @return The newly created L1 wallet address.
   */
  public async createBitcoinFundingAddress() {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: CreateBitcoinFundingAddress,
      constructObject: (responseJson: any) => {
        return responseJson.create_bitcoin_funding_address
          .bitcoin_address as string;
      },
    });
  }

  /**
   * @return The current wallet if one exists, null otherwise.
   */
  public async getCurrentWallet() {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: CurrentWalletQuery,
      constructObject: (responseJson: any) => {
        return WalletFromJson(responseJson.current_wallet);
      },
    });
  }

  /**
   * Withdraws funds from the account and sends it to the requested bitcoin
   * address.
   *
   * The process is asynchronous and may take up to a few minutes.
   * You can check the progress by polling the `WithdrawalRequest` that is
   * created, or by subscribing to a webhook.
   *
   * @param amountSats The amount of funds to withdraw in SATOSHI.
   * @param bitcoinAddress The Bitcoin address to withdraw funds to.
   */
  public async requestWithdrawal(
    amountSats: number,
    bitcoinAddress: string,
  ): Promise<WithdrawalRequest | null> {
    await this.requireValidAuth();
    this.requireWalletUnlocked();
    return await this.executeRawQuery({
      queryPayload: RequestWithdrawalMutation,
      variables: {
        amount_sats: amountSats,
        bitcoin_address: bitcoinAddress,
      },
      constructObject: (responseJson: any) => {
        return WithdrawalRequestFromJson(
          responseJson.request_withdrawal.request,
        );
      },
      signingNodeId: WALLET_NODE_ID_KEY,
    });
  }

  /**
   * In test mode, generates a Lightning Invoice which can be paid by a local
   * node. This call is only valid in test mode.
   * You can then pay the invoice using [payInvoice].
   *
   * @param amountMsats The amount to pay in milli-satoshis.
   * @param memo An optional memo to attach to the invoice.
   * @param invoiceType The type of invoice to create.
   */
  public async createTestModeInvoice(
    amountMsats: number,
    memo: string | undefined = undefined,
    invoiceType: InvoiceType = InvoiceType.STANDARD,
  ): Promise<string | null> {
    await this.requireValidAuth();
    return await this.executeRawQuery({
      queryPayload: CreateTestModeInvoice,
      variables: {
        amount_msats: amountMsats,
        memo,
        invoice_type: invoiceType,
      },
      constructObject: (responseJson: any) => {
        const encodedPaymentRequest =
          responseJson.create_test_mode_invoice?.encoded_payment_request;
        if (!encodedPaymentRequest) {
          throw new LightsparkException(
            "CreateTestModeInvoiceError",
            "Unable to create test mode invoice",
          );
        }
        return encodedPaymentRequest as string;
      },
    });
  }

  /**
   * In test mode, simulates a payment of a Lightning Invoice from another
   * node. This can only be used in test mode and should be used with invoices
   * generated by [createInvoice].
   *
   * @param encodedInvoice The encoded invoice to pay.
   * @param amountMsats The amount to pay in milli-satoshis for 0-amount invoices. This should be null for non-zero
   *     amount invoices.
   */
  public async createTestModePayment(
    encodedInvoice: string,
    amountMsats: number | undefined = undefined,
  ): Promise<IncomingPayment | null> {
    await this.requireValidAuth();
    this.requireWalletUnlocked();
    return await this.executeRawQuery({
      queryPayload: CreateTestModePayment,
      variables: {
        encoded_invoice: encodedInvoice,
        amount_msats: amountMsats,
      },
      constructObject: (responseJson: any) => {
        return IncomingPaymentFromJson(
          responseJson.create_test_mode_payment?.incoming_payment,
        );
      },
      signingNodeId: WALLET_NODE_ID_KEY,
    });
  }

  /**
   * @return True if the wallet is unlocked or false if it is locked.
   */
  public isWalletUnlocked() {
    return this.nodeKeyCache.hasKey(WALLET_NODE_ID_KEY);
  }

  private async requireValidAuth() {
    if (!(await this.isAuthorized())) {
      throw new LightsparkAuthException(
        "You must be logged in to perform this action.",
      );
    }
  }

  private requireWalletUnlocked() {
    if (!this.isWalletUnlocked()) {
      throw new LightsparkAuthException(
        "You must unlock the wallet before performing this action.",
      );
    }
  }

  private waitForWalletStatus(
    statuses: WalletStatus[],
    timeoutSecs: number = 60,
  ): Promise<WalletStatus> {
    let timeout: ReturnType<typeof setTimeout>;
    let subscription: Subscription;
    const result: Promise<WalletStatus> = new Promise((resolve, reject) => {
      subscription = this.listenToWalletStatus().subscribe({
        next: (status) => {
          if (statuses.includes(status)) {
            resolve(status);
          }
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          reject(
            new LightsparkException(
              "WalletStatusAwaitError",
              "Wallet status subscription completed without receiving a status update.",
            ),
          );
        },
      });

      timeout = setTimeout(() => {
        reject(
          new LightsparkException(
            "WalletStatusAwaitError",
            `Timed out waiting for wallet status to be one of ${statuses.join(
              ", ",
            )}.`,
          ),
        );
      }, timeoutSecs * 1000);
    });

    return result.finally(() => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    });
  }

  private listenToWalletStatus(): Observable<WalletStatus> {
    return this.requester
      .subscribe(
        `
      subscription WalletStatusSubscription {
        current_wallet {
          status
        }
      }`,
      )
      .map((responseJson: any) => {
        return (WalletStatus[responseJson.data.current_wallet.status] ??
          WalletStatus.FUTURE_VALUE) as WalletStatus;
      });
  }

  /**
   * Executes a raw `Query` as a subscription and returns an `Observable` that
   * emits the result of the query when it changes.
   *
   * This can only be used with `subscription` operations.
   *
   * @param query The `Query` to execute.
   * @returns A zen-observable that emits the result of the query when it changes.
   */
  public subscribeToRawQuery<T>(query: Query<T>): Observable<T> {
    return this.requester
      .subscribe(query.queryPayload, query.variables)
      .map((responseJson: any) => {
        return query.constructObject(responseJson.data);
      });
  }

  /**
   * Executes a raw `Query` against the Lightspark API.
   *
   * This generally should not be used directly,
   * but is exposed for advanced use cases and for internal use to retrieve
   * complex fields from objects.
   *
   * @param query The `Query` to execute.
   * @returns The result of the query.
   */
  public executeRawQuery<T>(query: Query<T>): Promise<T | null> {
    return this.requester.executeQuery(query);
  }
}

const WALLET_NODE_ID_KEY = "wallet_node_id";
const WALLET_SDK_ENDPOINT = "graphql/wallet/2023-05-05";

export default LightsparkClient;
