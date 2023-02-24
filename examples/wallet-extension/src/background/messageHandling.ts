import { LightsparkWalletClient } from "@lightspark/js-sdk";
import {
  BitcoinNetwork,
  CurrencyUnit,
} from "@lightspark/js-sdk/generated/graphql";
import AccountStorage from "../auth/AccountStorage";
import { VideoPlaybackUpdateMessage } from "../types";
import { LinearPaymentStrategy } from "./PaymentStrategy";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import TransactionObserver from "./TransactionObserver";
import VideoProgressCache from "./VideoProgressCache";

const paymentStrategy = new LinearPaymentStrategy(
  { unit: CurrencyUnit.Satoshi, value: 10 },
  1
);

const playbackMessageReceived = async (
  message: VideoPlaybackUpdateMessage,
  lightsparkClient: LightsparkWalletClient,
  progressCache: VideoProgressCache,
  invoiceHolder: StreamingInvoiceHolder,
  sendResponse: (response?: any) => void
) => {
  const previousRanges = progressCache.getPlayedRanges(message.videoID).slice();
  progressCache.addProgress(
    message.videoID,
    message.prevProgress || 0,
    message.progress
  );
  // Only send payments for the demo streaming video for now:
  if (message.videoID !== "ls_demo") {
    sendResponse({ amountToPay: { unit: CurrencyUnit.Satoshi, value: 0 } });
    return;
  }
  const amountToPay = paymentStrategy.onPlayedRange(
    previousRanges,
    progressCache.getPlayedRanges(message.videoID)
  );
  const invoiceToPay = await invoiceHolder.getInvoiceData();
  if (amountToPay.value > 0) {
    if (!invoiceToPay) {
      console.error("No invoice to pay while streaming");
    } else {
      // TODO: Ensure that the viewer node is unlocked at this point.
      await lightsparkClient.payInvoice(invoiceToPay, 60, amountToPay);
    }
  }
  sendResponse({ amountToPay });
};

const getWalletStatus = async (lightsparkClient: LightsparkWalletClient) => {
  const isAuthorized = await lightsparkClient.isAuthorized();
  if (!isAuthorized) {
    return "no_wallet";
  }
  return "funded";
};

export const onMessageReceived = (
  message: any,
  lightsparkClient: LightsparkWalletClient,
  progressCache: VideoProgressCache,
  invoiceHolder: StreamingInvoiceHolder,
  accountStorage: AccountStorage,
  transactionObserver: TransactionObserver,
  sendResponse: (response: any) => void
) => {
  switch (message.id) {
    case "video_play":
      transactionObserver.startListening();
      sendResponse({ status: "ok" });
      break;
    case "video_pause":
      setTimeout(() => {
        transactionObserver.stopListening();
      }, 3000);
      sendResponse({ status: "ok" });
      break;
    case "ping":
      sendResponse("pong");
      break;
    case "get_version":
      sendResponse({ version: chrome.runtime.getManifest().version });
      break;
    case "video_progress":
      playbackMessageReceived(
        message,
        lightsparkClient,
        progressCache,
        invoiceHolder,
        sendResponse
      );
      break;
    case "get_wallet_status":
      // TODO: Send messages when the status changes.
      getWalletStatus(lightsparkClient).then((status) => {
        sendResponse({ status });
      });
      break;
    case "get_wallet_address":
      lightsparkClient
        .getWalletDashboard(BitcoinNetwork.Regtest)
        .then((wallet) => {
          const walletName =
            wallet.current_account?.dashboard_overview_nodes.edges[0].entity
              .display_name || "";
          sendResponse({ address: walletName });
        });
      break;
    case "get_wallet_transactions":
      accountStorage.getAccountCredentials().then((account) => {
        if (!account) {
          sendResponse({ transactions: [] });
          return;
        }

        lightsparkClient
          .getRecentTransactions(
            20,
            BitcoinNetwork.Regtest,
            true,
            account.allocationTime
          )
          .then((transactions) => {
            sendResponse({ transactions });
          });
      });
      break;
    case "get_streaming_wallet_balances":
      lightsparkClient
        .getAllNodesDashboard(undefined, BitcoinNetwork.Regtest, true)
        .then(async (dashboard) => {
          const zeroSats = { unit: CurrencyUnit.Satoshi, value: 0 };
          const account = await accountStorage.getAccountCredentials();
          if (!account) {
            sendResponse({
              balances: { viewerBalance: zeroSats, creatorBalance: zeroSats },
            });
            return;
          }
          const edges =
            dashboard.current_account?.dashboard_overview_nodes.edges;
          const viewerNode = edges?.find((edge) =>
            edge.entity.id.includes(account.viewerWalletId)
          )?.entity;
          const creatorNode = edges?.find((edge) =>
            edge.entity.id.includes(account.creatorWalletId)
          )?.entity;
          const balances = {
            viewerBalance: viewerNode?.local_balance || zeroSats,
            creatorBalance: creatorNode?.local_balance || zeroSats,
          };
          sendResponse({ balances });
        });
      break;
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
      sendResponse({ status: "unknown" });
  }
};
