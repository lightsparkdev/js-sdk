import {
  BitcoinNetwork,
  CurrencyUnit,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import AccountStorage from "../auth/AccountStorage";
import { VideoPlaybackUpdateMessage } from "../types/Messages";
import { LinearPaymentStrategy } from "./PaymentStrategy";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import TransactionObserver from "./TransactionObserver";
import VideoProgressCache from "./VideoProgressCache";

const paymentStrategy = new LinearPaymentStrategy(10_000, 1);

const playbackMessageReceived = async (
  message: VideoPlaybackUpdateMessage,
  lightsparkClient: LightsparkClient,
  viewerNodeId: string | undefined,
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
    sendResponse({ amountToPay: 0 });
    return;
  }
  const amountToPay = paymentStrategy.onPlayedRange(
    previousRanges,
    progressCache.getPlayedRanges(message.videoID)
  );
  const invoiceToPay = await invoiceHolder.getInvoiceData();
  if (amountToPay > 0) {
    console.log(`Paying: ${amountToPay / 1000} sats`);
    if (!invoiceToPay || !viewerNodeId) {
      console.error("No invoice to pay while streaming");
    } else {
      await lightsparkClient.payInvoice(
        viewerNodeId,
        invoiceToPay,
        Math.ceil(amountToPay * 0.0016 + 5),
        60,
        amountToPay
      );
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

let pendingPause: NodeJS.Timeout | undefined;

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
        if (pendingPause) {
          clearTimeout(pendingPause);
          pendingPause = undefined;
        }
        sendResponse({ status: "ok" });
      });
      break;
    case "video_pause":
      pendingPause = setTimeout(() => {
        transactionObserver.stopListening();
        pendingPause = undefined;
      }, 10000);
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
      chrome.windows.getCurrent().then((activeWindow) => {
        chrome.windows.create(
          {
            url: "index.html",
            type: "popup",
            width: 300,
            height: 408,
            left: Math.round(
              (activeWindow.left ?? 0) + (activeWindow.width ?? 0) - 480
            ),
            top: Math.round((activeWindow.top ?? 0) + 90),
          },
          () => console.log("opened popup")
        );
      });
      sendResponse({ status: "ok" });
      break;
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
      sendResponse({ status: "unknown" });
  }
};
