import { useLightsparkClient } from "@lightsparkdev/react-wallet";
import type { JwtStorage, Wallet } from "@lightsparkdev/wallet-sdk";
import {
  CustomJwtAuthProvider,
  InMemoryJwtStorage,
} from "@lightsparkdev/wallet-sdk";
import { useCallback, useEffect, useState } from "react";

const useWalletInfo = (tokenStorage?: JwtStorage) => {
  const clientProvider = useLightsparkClient();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const refresh = useCallback(() => {
    void clientProvider.isAuthenticated().then((isAuthed) => {
      if (!isAuthed) {
        return;
      }
      const client = clientProvider.getClient();
      void client.getCurrentWallet().then((wallet) => {
        if (wallet) {
          setWallet(wallet);
        }
      });
    });
  }, [clientProvider]);

  useEffect(() => {
    clientProvider.setAuthProvider(
      new CustomJwtAuthProvider(tokenStorage ?? new InMemoryJwtStorage())
    );
    void refresh();
  }, [clientProvider, refresh, tokenStorage]);

  return { wallet, refresh };
};

export default useWalletInfo;
