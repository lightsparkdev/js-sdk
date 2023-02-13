import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { CurrencyUnit } from "@lightspark/js-sdk/generated/graphql";
import { VideoPlaybackUpdateMessage } from "../types";
import { LinearPaymentStrategy } from "./PaymentStrategy";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import VideoProgressCache from "./VideoProgressCache";

const paymentStrategy = new LinearPaymentStrategy(
  { unit: CurrencyUnit.Satoshi, value: 10 },
  3
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
  const amountToPay = paymentStrategy.onPlayedRange(
    previousRanges,
    progressCache.getPlayedRanges(message.videoID)
  );
  const invoiceToPay = invoiceHolder.getInvoiceData();
  if (amountToPay.value > 0) {
    if (!invoiceToPay) {
      console.error("No invoice to pay while streaming");
    } else {
      // TODO: Ensure that the viewer node is unlocked at this point.
      await lightsparkClient.payInvoice(invoiceToPay, undefined, amountToPay);
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
  sendResponse: (response: any) => void
) => {
  switch (message.id) {
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
      lightsparkClient.getWalletDashboard().then((wallet) => {
        const walletName =
          wallet.current_account?.dashboard_overview_nodes.edges[0].entity
            .display_name || "";
        sendResponse({ address: walletName });
      });
      break;
    case "get_wallet_transactions":
      lightsparkClient.getWalletDashboard().then((wallet) => {
        // TODO: Move this to its own message.
        const transactions =
          wallet?.current_account?.recent_transactions.edges.map(
            (it) => it.entity
          ) || [];
        sendResponse({ transactions });
      });
      break;
    case "get_streaming_wallet_balances":
      lightsparkClient.getAllNodesDashboard().then((dashboard) => {
        const viewerNode =
          dashboard.current_account?.dashboard_overview_nodes.edges[0].entity;
        const creatorNode =
          dashboard.current_account?.dashboard_overview_nodes.edges[1].entity;
        const balances = {
          viewerBalance: viewerNode?.blockchain_balance?.available_balance || 0,
          creatorBalance:
            creatorNode?.blockchain_balance?.available_balance || 0,
        };
        sendResponse({ balances });
      });
      break;
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
      sendResponse({ status: "unknown" });
  }
};
