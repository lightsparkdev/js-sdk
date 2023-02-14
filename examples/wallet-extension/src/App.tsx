import styled from "@emotion/styled";
import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { AccountTokenAuthProvider } from "@lightspark/js-sdk/auth/AccountTokenAuthProvider";
import {
  BitcoinNetwork,
  CurrencyAmount,
  SingleNodeDashboardQuery,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import React from "react";
import "./App.css";
import AccountStorage from "./auth/AccountStorage";
import { reserveStreamingDemoAccountCredentials } from "./auth/DemoAccountProvider";
import StreamingDemoAccountCredentials from "./auth/StreamingDemoCredentials";
import VideoProgressCache from "./background/VideoProgressCache";
import { findActiveStreamingDemoTabs } from "./common/streamingTabs";
import { Maybe } from "./common/types";
import CirclePlusIcon from "./components/CirclePlusIcon";
import CurrencyAmountRaw from "./components/CurrencyAmountRaw";
import LeftArrow from "./components/LeftArrow";
import StreamingTransactionChip from "./components/StreamingTransactionChip";
import TransactionRow from "./components/TransactionRow";
import { getLightsparkClient } from "./lightsparkClientProvider";

enum Screen {
  Balance,
  Transactions,
  Login,
}

const DEMO_VIDEO_ID = "ls_demo";

function App() {
  const [walletDashboard, setWalletDashboard] =
    React.useState<SingleNodeDashboardQuery>();
  const [screen, setScreen] = React.useState<Screen>(Screen.Login);
  const [lightsparkClient, setLightsparkClient] =
    React.useState<LightsparkWalletClient>();
  const [credentials, setCredentials] =
    React.useState<StreamingDemoAccountCredentials | null>();
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [demoStreamingDuration, setDemoStreamingDuration] = React.useState(0);

  React.useEffect(() => {
    chrome.storage.local
      .get(["walletDashboard"])
      .then(async (cachedBalance) => {
        if (cachedBalance) {
          setWalletDashboard(cachedBalance.walletDashboard);
        }
        const accountStorage = new AccountStorage();
        setCredentials(await accountStorage.getAccountCredentials());
        const client = await getLightsparkClient(accountStorage);
        setLightsparkClient(client);
      });

    const progressCache = new VideoProgressCache();
    progressCache.listenForProgressChanges((videoId) => {
      if (videoId === DEMO_VIDEO_ID) {
        setDemoStreamingDuration(
          progressCache.getPlayedDuration(DEMO_VIDEO_ID)
        );
      }
    });
    progressCache.whenLoaded().then(() => {
      setDemoStreamingDuration(progressCache.getPlayedDuration(DEMO_VIDEO_ID));
    });

    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      if (message.id === "video_play" || message.id === "video_pause") {
        setIsStreaming(message.isPlaying);
      } else if (message.id === "video_progress") {
        progressCache.addProgress(
          message.videoID,
          message.prevProgress || 0,
          message.progress
        );
      }
    });

    findActiveStreamingDemoTabs().then((tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(
        tabs[0].id!,
        { id: "is_video_playing" },
        (isPlaying) => {
          setIsStreaming(isPlaying);
        }
      );
    });
  }, []);

  React.useEffect(() => {
    if (!lightsparkClient || !credentials) {
      return;
    }
    setScreen(Screen.Balance);
    lightsparkClient.getWalletDashboard(BitcoinNetwork.Regtest).then(async (dashboard) => {
      setWalletDashboard(dashboard);
      await chrome.storage.local.set({ walletDashboard: dashboard });
      findActiveStreamingDemoTabs().then((tabs) => {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id!, {
          id: "transactions_updated",
          transactions:
            dashboard?.current_account?.recent_transactions.edges.map(
              (it) => it.entity
            ) || [],
        });
      });
    });
  }, [lightsparkClient, credentials]);

  const body = !lightsparkClient ? (
    <></>
  ) : screen === Screen.Balance ? (
    <BalanceScreen
      balance={
        walletDashboard?.current_account?.blockchain_balance?.available_balance
      }
      transactions={
        walletDashboard?.current_account?.recent_transactions.edges.map(
          (it) => it.entity
        ) || []
      }
      streamingDuration={demoStreamingDuration}
      isStreaming={isStreaming}
    />
  ) : screen === Screen.Transactions ? (
    <TransactionsScreen
      transactions={
        walletDashboard?.current_account?.recent_transactions.edges.map(
          (it) => it.entity
        ) || []
      }
    />
  ) : (
    <LoginScreen
      lightsparkClient={lightsparkClient}
      onCreatedAccount={async (credentials) => {
        lightsparkClient?.setAuthProvider(
          new AccountTokenAuthProvider(credentials.clientId, credentials.clientSecret)
        );
        lightsparkClient?.setActiveWalletWithoutUnlocking(
          credentials.viewerWalletId
        );
        await new AccountStorage().saveAccountCredentials(credentials);
        setCredentials(credentials);
      }}
    />
  );
  return (
    <div className="app-wrapper">
      {Header(screen, setScreen)}
      <div className="content-wrapper">{body}</div>
    </div>
  );
}

function Header(screen: Screen, setScreen: (screen: Screen) => void) {
  if (screen === Screen.Balance) {
    return (
      <div className="header">
        <img
          src="lightspark_full.png"
          className="app-logo"
          alt="Lightspark logo"
        />
        {/* Disabled for now, but goes to the transaction list screen: */}
        {/* <button onClick={() => setScreen(Screen.Transactions)}>☰</button> */}
      </div>
    );
  } else if (screen === Screen.Transactions) {
    return (
      <div className="header">
        <button onClick={() => setScreen(Screen.Balance)}>
          <LeftArrow />
        </button>
        <HeaderBackText>Transactions</HeaderBackText>
      </div>
    );
  }
  return (
    <div className="header">
      <img
        src="lightspark_full.png"
        className="app-logo"
        alt="Lightspark logo"
      />
    </div>
  );
}

function BalanceScreen(props: {
  balance: Maybe<CurrencyAmount>;
  transactions: TransactionDetailsFragment[];
  streamingDuration: number;
  isStreaming: boolean;
}) {
  const screenContent = !props.balance ? (
    <div
      className="loading-text"
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Loading wallet...
    </div>
  ) : (
    <>
      <BalanceLabel>Balance</BalanceLabel>
      <div className="balance">
        <CurrencyAmountRaw
          shortNumber
          shortUnit
          value={props.balance?.value}
          unit={props.balance?.unit}
          symbol
        ></CurrencyAmountRaw>
      </div>
      {props.transactions.length > 0 ? (
        <StreamingTransactionChip
          transactions={props.transactions}
          streamingDuration={props.streamingDuration}
          isStreaming={props.isStreaming}
        />
      ) : (
        <InstructionsText>
          Click the play button on the video to stream bitcoin in real-time.
        </InstructionsText>
      )}
    </>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "end",
        padding: "0 24px",
        height: "100%",
      }}
    >
      {screenContent}
    </div>
  );
}

function LoginScreen(props: {
  lightsparkClient: LightsparkWalletClient | undefined;
  onCreatedAccount: (credentials: StreamingDemoAccountCredentials) => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const createWallet = async () => {
    setIsLoading(true);
    const creds = await reserveStreamingDemoAccountCredentials();
    if (creds) props.onCreatedAccount(creds);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "end",
        padding: "0 24px",
        height: "100%",
      }}
    >
      <LoginHeader>Start Streaming</LoginHeader>
      <InstructionsText>
        Create a wallet and we'll deposit 250 SATs for you to stream.
      </InstructionsText>
      <CreateWalletButton onClick={createWallet} disabled={isLoading}>
        {!isLoading ? (
          <span style={{ marginInlineEnd: "4px" }}>
            <CirclePlusIcon />
          </span>
        ) : (
          <></>
        )}
        {isLoading ? "Loading..." : "Create Wallet"}
      </CreateWalletButton>
    </div>
  );
}

function TransactionsScreen(props: {
  transactions: TransactionDetailsFragment[];
}) {
  return (
    <div style={{ width: "100%" }}>
      {props.transactions.map((transaction) => (
        <TransactionRow transaction={transaction} />
      ))}
    </div>
  );
}

const BalanceLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #999999;
  margin-bottom: 4px;
`;

const InstructionsText = styled.p`
  font-size: 10px;
  font-weight: 500;
  color: #999999;
  margin-bottom: 16px;
`;

const LoginHeader = styled.p`
  font-size: 21px;
  font-weight: 800;
  color: white;
  margin-bottom: 0;
`;

const HeaderBackText = styled.span`
  font-size: 12px;
  color: white;
  font-weight: 700;
`;

const CreateWalletButton = styled.button`
  background: white;
  color: black;
  display: flex;
  border: none;
  border-radius: 32px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 24px;
  width: 124px;
`;

export default App;
