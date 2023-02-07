import { getLightsparkClient } from "../lightsparkClientProvider";
import { startListeningForNavigations } from "../NavigationTracker";
import { VideoPlaybackUpdateMessage } from "../types";
import VideoProgressCache from "./VideoProgressCache";

const progressCache = new VideoProgressCache();
const lightsparkClient = getLightsparkClient();

const playbackMessageReceived = async (message: VideoPlaybackUpdateMessage) => {
  progressCache.addProgress(
    message.videoID,
    message.prevProgress || 0,
    message.progress
  );
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
      playbackMessageReceived(message);
      break;
    case "is_wallet_connected":
      sendResponse({ isConnected: true });
      break;
    case "get_wallet_address":
      return lightsparkClient.getWalletDashboard().then((wallet) => {
        const walletName =
          wallet.current_account?.dashboard_overview_nodes.edges[0].entity
            .display_name || "";
        sendResponse({ address: walletName });
        return { address: walletName };
      });
    case "get_wallet_balance":
      return lightsparkClient.getWalletDashboard().then((wallet) => {
        const walletNode =
          wallet.current_account?.dashboard_overview_nodes.edges[0].entity;
        const balance = walletNode?.blockchain_balance?.available_balance || 0;
        sendResponse({ balance: balance });
        return { balance: balance };
      });
    case "get_streaming_wallet_balances":
      return lightsparkClient.getAllNodesDashboard().then((dashboard) => {
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
    default:
      console.log(`Unknown message received: ${JSON.stringify(message)}`);
  }
});

startListeningForNavigations();
