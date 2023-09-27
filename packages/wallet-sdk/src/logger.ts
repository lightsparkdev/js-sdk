import { Logger } from "@lightsparkdev/core";
import AsyncStorage, {
  type AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";

export const logger = new Logger("@lightsparkdev/wallet-sdk", async () => {
  try {
    const enabled = await (AsyncStorage as any as AsyncStorageStatic).getItem(
      "lightspark-logging-enabled",
    );
    return enabled === "1";
  } catch (e) {
    return false;
  }
});
