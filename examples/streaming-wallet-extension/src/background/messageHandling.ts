import { LightsparkClient } from "@lightsparkdev/js-sdk";
import {
  BitcoinNetwork,
  CurrencyUnit,
} from "@lightsparkdev/js-sdk/objects";
import AccountStorage from "../auth/AccountStorage";
import { VideoPlaybackUpdateMessage } from "../types";
import { LinearPaymentStrategy } from "./PaymentStrategy";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import TransactionObserver from "./TransactionObserver";
import VideoProgressCache from "./VideoProgressCache";

const paymentStrategy = new LinearPaymentStrategy(
  { unit: CurrencyUnit.SATOSHI, value: 10 },
  2
);

const playbackMessageReceived = async (
  message: VideoPlaybackUpdateMessage,
  lightsparkClient: LightsparkClient,
  viewerNodeId: string|undefined,
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
    sendResponse({ amountToPay: { unit: CurrencyUnit.SATOSHI, value: 0 } });
    return;
  }
  const amountToPay = paymentStrategy.onPlayedRange(
    previousRanges,
    progressCache.getPlayedRanges(message.videoID)
  );
  const invoiceToPay = await invoiceHolder.getInvoiceData();
  if (amountToPay.value > 0) {
    if (!invoiceToPay || !viewerNodeId) {
      console.error("No invoice to pay while streaming");
    } else {
      await lightsparkClient.payInvoice(viewerNodeId, invoiceToPay, 60, amountToPay);
    }
  }
  sendResponse({ amountToPay });
};

const getWalletStatus = async (lightsparkClient: LightsparkClient) => {
  const isAuthorized = await lightsparkClient.isAuthorized();
  if (!isAuthorized) {
    return "no_wallet";
  }
  return "funded";
};

export const onMessageReceived = (
  message: any,
  lightsparkClient: LightsparkClient,
  progressCache: VideoProgressCache,
  invoiceHolder: StreamingInvoiceHolder,
  accountStorage: AccountStorage,
  transactionObserver: TransactionObserver,
  sendResponse: (response: any) => void
) => {
  switch (message.id) {
    case "video_play":
      accountStorage.getAccountCredentials().then((account) => {
        transactionObserver.startListening(account!.viewerWalletId);
        sendResponse({ status: "ok" });
      });
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
      accountStorage.getAccountCredentials().then((account) => {
        playbackMessageReceived(
          message,
          lightsparkClient,
          account?.viewerWalletId,
          progressCache,
          invoiceHolder,
          sendResponse
        );
      });
      break;
    case "get_wallet_status":
      // TODO: Send messages when the status changes.
      getWalletStatus(lightsparkClient).then((status) => {
        sendResponse({ status });
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
            account.viewerWalletId,
            20,
            BitcoinNetwork.REGTEST,
            account.allocationTime
          )
          .then((transactions) => {
            sendResponse({ transactions });
          });
      });
      break;
    case "get_streaming_wallet_balances":
      // Hack for testing. Remove this line when releasing:
      progressCache.clear();
      lightsparkClient
        .getAccountDashboard(undefined, BitcoinNetwork.REGTEST)
        .then(async (dashboard) => {
          const zeroSats = { unit: CurrencyUnit.SATOSHI, value: 0 };
          const account = await accountStorage.getAccountCredentials();
          if (!account) {
            sendResponse({
              balances: { viewerBalance: zeroSats, creatorBalance: zeroSats },
            });
            return;
          }
          const viewerNode = dashboard.nodes?.find((node) =>
            node.id.includes(account.viewerWalletId)
          );
          const creatorNode = dashboard.nodes?.find((node) =>
          node.id.includes(account.creatorWalletId)
        );
          const balances = {
            viewerBalance: viewerNode?.localBalance || zeroSats,
            creatorBalance: creatorNode?.localBalance || zeroSats,
          };
          sendResponse({ balances });
        });
      break;
    case "open_and_create_wallet":
      // TODO: Implement this.
      sendResponse({ status: "ok" });
      break;
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
      sendResponse({ status: "unknown" });
  }
};
