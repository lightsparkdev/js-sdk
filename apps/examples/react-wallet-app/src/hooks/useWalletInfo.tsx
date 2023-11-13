import { useLightsparkClient } from "@lightsparkdev/react-wallet";
import type { Wallet } from "@lightsparkdev/wallet-sdk";
import {
  CustomJwtAuthProvider,
  LocalStorageJwtStorage,
} from "@lightsparkdev/wallet-sdk";
import { useCallback, useEffect, useState } from "react";

const useWalletInfo = () => {
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
      new CustomJwtAuthProvider(new LocalStorageJwtStorage())
    );
    void refresh();
  }, [clientProvider, refresh]);

  return { wallet, refresh };
};

export default useWalletInfo;
