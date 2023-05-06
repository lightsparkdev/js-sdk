import { useLightsparkClient } from "@lightsparkdev/react-wallet";
import {
  CustomJwtAuthProvider,
  LocalStorageJwtStorage,
  Wallet,
} from "@lightsparkdev/wallet-sdk";
import { useCallback, useEffect, useState } from "react";

const useWalletInfo = () => {
  const clientProvider = useLightsparkClient();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const refresh = useCallback(async () => {
    clientProvider.isAuthenticated().then((isAuthed) => {
      if (!isAuthed) {
        return;
      }
      const client = clientProvider.getClient();
      client.getCurrentWallet().then(async (wallet) => {
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
    refresh();
  }, [clientProvider, refresh]);


  return { wallet, refresh };
};

export default useWalletInfo;
