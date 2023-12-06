import { Currency } from "@uma-sdk/core";
import { User } from "./User.js";

export default interface UserService {
  getCallingUserFromRequest(
    fullUrl: URL,
    headers: { [key: string]: string | string[] | undefined },
  ): Promise<User | undefined>;
  getUserByUma(umaAddress: string): Promise<User | undefined>;
  getUserById(userId: string): Promise<User | undefined>;
  getCurrencyPreferencesForUser(
    userId: string,
  ): Promise<Currency[] | undefined>;
}
