import styled from "@emotion/styled";
import { AccountTokenAuthProvider } from "@lightsparkdev/js-sdk/auth";
import { WalletDashboard } from "@lightsparkdev/js-sdk/graphql/SingleNodeDashboard";
import { LightsparkClient } from "@lightsparkdev/js-sdk/index";
import {
  BitcoinNetwork,
  CurrencyAmount,
  Transaction,
} from "@lightsparkdev/js-sdk/objects";
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
import { getWalletClient } from "./lightsparkClientProvider";

enum Screen {
  Balance,
  Transactions,
  Login,
}

const DEMO_VIDEO_ID = "ls_demo";

function App() {
  const [walletDashboard, setWalletDashboard] =
    React.useState<WalletDashboard>();
  const [screen, setScreen] = React.useState<Screen>(Screen.Login);
  const [lightsparkClient, setLightsparkClient] =
    React.useState<LightsparkClient>();
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
        let credentials = await accountStorage.getAccountCredentials();
        if (credentials && Date.now() > credentials.expiresAt) {
          await chrome.storage.local.clear();
          credentials = null;
        }
        setCredentials(credentials);
        const client = await getWalletClient(accountStorage);
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
    lightsparkClient
      .getSingleNodeDashboard(
        credentials.viewerWalletId,
        BitcoinNetwork.REGTEST,
        credentials.allocationTime
      )
      .then(async (dashboard) => {
        setWalletDashboard(dashboard);
        await chrome.storage.local.set({ walletDashboard: dashboard });
      });
  }, [lightsparkClient, credentials]);

  const body = !lightsparkClient ? (
    <></>
  ) : screen === Screen.Balance ? (
    <BalanceScreen
      balance={walletDashboard?.localBalance}
      transactions={walletDashboard?.recentTransactions || []}
      streamingDuration={demoStreamingDuration}
      isStreaming={isStreaming}
    />
  ) : screen === Screen.Transactions ? (
    <TransactionsScreen
      transactions={walletDashboard?.recentTransactions || []}
    />
  ) : (
    <LoginScreen
      lightsparkClient={lightsparkClient}
      onCreatedAccount={async (credentials) => {
        lightsparkClient?.setAuthProvider(
          new AccountTokenAuthProvider(
            credentials.clientId,
            credentials.clientSecret
          )
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
  transactions: Transaction[];
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
        <InstructionsText style={{ fontSize: "16px" }}>
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
  lightsparkClient: LightsparkClient | undefined;
  onCreatedAccount: (credentials: StreamingDemoAccountCredentials) => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | undefined>(
    undefined
  );

  const createWallet = async () => {
    setIsLoading(true);
    const creds = await reserveStreamingDemoAccountCredentials();
    if (creds) {
      props.onCreatedAccount(creds);
      setErrorText(undefined);
    } else {
      setErrorText("Failed to create wallet.");
      setTimeout(() => {
        setErrorText(undefined);
      }, 3000);
    }
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
      <LoginHeader>One more step</LoginHeader>
      <InstructionsText>
        Create a wallet and we'll add funds for the demo.
      </InstructionsText>
      <CreateWalletButton onClick={createWallet} disabled={isLoading}>
        {!isLoading ? (
          <span style={{ marginInlineEnd: "8px" }}>
            <CirclePlusIcon />
          </span>
        ) : (
          <></>
        )}
        {isLoading ? "Loading..." : "Create Wallet"}
      </CreateWalletButton>
      {errorText ? <ErrorText>{errorText}</ErrorText> : <></>}
    </div>
  );
}

function TransactionsScreen(props: { transactions: Transaction[] }) {
  return (
    <div style={{ width: "100%" }}>
      {props.transactions.map((transaction) => (
        <TransactionRow transaction={transaction} />
      ))}
    </div>
  );
}

const BalanceLabel = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #666666;
  margin-bottom: 4px;
`;

const InstructionsText = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: #666666;
  margin-bottom: 32px;
`;

const ErrorText = styled.p`
  font-size: 10px;
  font-weight: 700;
  color: red;
  margin-bottom: 8px;
`;

const LoginHeader = styled.p`
  font-size: 28px;
  color: black;
  margin-bottom: 0;
`;

const HeaderBackText = styled.span`
  font-size: 18px;
  color: black;
  font-weight: 700;
`;

const CreateWalletButton = styled.button`
  background: black;
  color: white;
  display: flex;
  border: none;
  border-radius: 32px;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 24px;
  width: 162px;
  justify-content: center;
`;

export default App;
