import { useLightsparkClient } from "@lightsparkdev/react-wallet";
import {
  CustomJwtAuthProvider,
  JwtStorage,
  Wallet,
} from "@lightsparkdev/wallet-sdk";
import { useCallback, useEffect, useState } from "react";
import { EncryptedLocalTokenStorage } from "@lightsparkdev/react-native";

const useWalletInfo = (tokenStorage?: JwtStorage) => {
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
      new CustomJwtAuthProvider(
        tokenStorage ?? new EncryptedLocalTokenStorage(),
      ),
    );
    refresh();
  }, [clientProvider, refresh, tokenStorage]);

  return { wallet, refresh };
};

export default useWalletInfo;
