import {
  PrivyProvider,
  useLogin,
  useLogout,
  usePrivy,
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Hex } from "viem";

import { PRIVY_APP_ID } from "../config";
import { isSameAddress, type EvmSigner } from "../evm-wallet";

// Privy creates the embedded wallet right after login; past this, it isn't coming.
const WALLET_CREATE_TIMEOUT_MS = 30_000;

/** The app's EVM wallet: a Privy embedded wallet behind a Privy login. */
export interface EvmWalletApi {
  /** The signed-in Privy user's wallet, opening Privy's login first when nobody is signed in. */
  connect: () => Promise<EvmSigner>;
  /** Log the current Privy user out and resolve with the wallet of whoever logs in next. */
  switchUser: () => Promise<EvmSigner>;
}

const EvmWalletContext = createContext<EvmWalletApi | null>(null);

/** Null when `VITE_PRIVY_APP_ID` is unset: the app then offers no EVM wallet. */
export function useEvmWallet(): EvmWalletApi | null {
  return useContext(EvmWalletContext);
}

/**
 * The signer for the credential at `address`. When Privy holds another user's
 * wallet, Privy's login opens once more for the credential's owner.
 */
export async function connectWalletFor(
  wallet: EvmWalletApi,
  address: string,
): Promise<EvmSigner> {
  const current = await wallet.connect();
  if (isSameAddress(current.address, address)) return current;
  const next = await wallet.switchUser();
  if (isSameAddress(next.address, address)) return next;
  throw new Error(
    `Privy signed in with ${next.address}, but this credential is ${address}.`,
  );
}

export function EvmWalletProvider({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID) return <>{children}</>;
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email"],
        embeddedWallets: { ethereum: { createOnLogin: "all-users" } },
      }}
    >
      <PrivyEvmWallet>{children}</PrivyEvmWallet>
    </PrivyProvider>
  );
}

interface WalletWaiter {
  resolve: (signer: EvmSigner) => void;
  reject: (e: Error) => void;
  /** Hold until Privy reports the previous user logged out. */
  afterLogout: boolean;
  loginOpened: boolean;
}

function PrivyEvmWallet({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const { logout } = useLogout();
  const waiter = useRef<WalletWaiter | null>(null);
  const [request, setRequest] = useState(0);

  const settle = useCallback(
    (outcome: { signer: EvmSigner } | { error: Error }) => {
      const w = waiter.current;
      waiter.current = null;
      if (!w) return;
      if ("signer" in outcome) w.resolve(outcome.signer);
      else w.reject(outcome.error);
    },
    [],
  );

  // Closing Privy's modal is a cancel, like closing a passkey sheet.
  const { login } = useLogin({
    onError: () => settle({ error: new Error("Privy login cancelled.") }),
  });

  // A signer outlives the render that made it, so it signs with the latest hook.
  const signMessageRef = useRef(signMessage);
  signMessageRef.current = signMessage;
  const signerFor = useCallback(
    (address: Hex): EvmSigner => ({
      address,
      signMessage: async (message) =>
        (await signMessageRef.current({ message }, { address }))
          .signature as Hex,
    }),
    [],
  );

  const embedded = wallets.find((w) => w.walletClientType === "privy");

  useEffect(() => {
    const w = waiter.current;
    if (!w || !ready) return;
    if (w.afterLogout) {
      if (authenticated) return;
      w.afterLogout = false;
    }
    if (!authenticated) {
      if (!w.loginOpened) {
        w.loginOpened = true;
        login();
      }
      return;
    }
    if (embedded) {
      settle({ signer: signerFor(embedded.address as Hex) });
      return;
    }
    const timer = setTimeout(
      () =>
        settle({
          error: new Error("Privy created no embedded wallet after login."),
        }),
      WALLET_CREATE_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [request, ready, authenticated, embedded, login, settle, signerFor]);

  const waitForWallet = useCallback(
    (afterLogout: boolean) =>
      new Promise<EvmSigner>((resolve, reject) => {
        settle({ error: new Error("Superseded by a newer wallet request.") });
        waiter.current = { resolve, reject, afterLogout, loginOpened: false };
        setRequest((n) => n + 1);
      }),
    [settle],
  );

  const api = useMemo<EvmWalletApi>(
    () => ({
      connect: () => waitForWallet(false),
      switchUser: async () => {
        await logout();
        return waitForWallet(true);
      },
    }),
    [waitForWallet, logout],
  );

  return (
    <EvmWalletContext.Provider value={api}>
      {children}
    </EvmWalletContext.Provider>
  );
}
