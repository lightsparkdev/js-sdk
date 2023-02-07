import { CurrencyUnit } from "@lightspark/js-sdk/generated/graphql";
import { getLightsparkClient } from "../lightsparkClientProvider";
import { startListeningForNavigations } from "../NavigationTracker";
import { VideoPlaybackUpdateMessage } from "../types";
import { LinearPaymentStrategy } from "./PaymentStrategy";
import VideoProgressCache from "./VideoProgressCache";

const progressCache = new VideoProgressCache();
const lightsparkClient = getLightsparkClient();
const paymentStrategy = new LinearPaymentStrategy(
  { unit: CurrencyUnit.Satoshi, value: 10 },
  3
);

const playbackMessageReceived = async (
  message: VideoPlaybackUpdateMessage,
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
  sendResponse({ amountToPay });
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "write_progress" && progressCache.needsWriteToStorage()) {
    progressCache.writeProgressToStorage();
  }
});

chrome.alarms.create("write_progress", { periodInMinutes: 5 });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.id) {
    case "video_progress":
      playbackMessageReceived(message, sendResponse);
      break;
    case "is_wallet_connected":
      sendResponse({ isConnected: true });
      break;
    case "get_wallet_address":
      lightsparkClient.getWalletDashboard().then((wallet) => {
        const walletName =
          wallet.current_account?.dashboard_overview_nodes.edges[0].entity
            .display_name || "";
        sendResponse({ address: walletName });
        return { address: walletName };
      });
      return true;
    case "get_wallet_dashboard":
      lightsparkClient.getWalletDashboard().then((wallet) => {
        const walletNode =
          wallet.current_account?.dashboard_overview_nodes.edges[0].entity;
        const balance = walletNode?.blockchain_balance?.available_balance || 0;
        sendResponse({ balance: balance });
        return { balance: balance };
      });
      return true;
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
        return { balances };
      });
      return true;
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
  }
});

startListeningForNavigations();
