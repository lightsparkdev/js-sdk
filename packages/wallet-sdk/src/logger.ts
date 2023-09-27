import { Logger } from "@lightsparkdev/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const logger = new Logger("@lightsparkdev/wallet-sdk", async () => {
  try {
    const enabled = await AsyncStorage.getItem("lightspark-logging-enabled");
    return enabled === "1";
  } catch (e) {
    return false;
  }
});
