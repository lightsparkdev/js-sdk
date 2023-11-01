import { ConfigKeys, isTest, Logger } from "@lightsparkdev/core";
import AsyncStorage, {
  type AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";

export const logger = new Logger("@lightsparkdev/wallet-sdk", async () => {
  try {
    if (isTest) {
      return true;
    }

    const enabled = await (AsyncStorage as any as AsyncStorageStatic).getItem(
      ConfigKeys.LoggingEnabled,
    );
    return enabled === "1";
  } catch (e) {
    return false;
  }
});
