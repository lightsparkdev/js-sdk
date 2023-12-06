import { Currency, KycStatus } from "@uma-sdk/core";
import { requireEnv } from "../UmaConfig.js";
import { User } from "../User.js";
import UserService from "../UserService.js";

// Static UUID so that callback URLs are always the same.
const DEMO_UID = "4b41ae03-01b8-4974-8d26-26a35d28851b";

export default class DemoUserService implements UserService {
  private usersById: Map<string, User>;

  constructor() {
    this.usersById = new Map<string, User>();
    this.usersById.set(DEMO_UID, {
      id: DEMO_UID,
      umaUserName: requireEnv("LIGHTSPARK_UMA_RECEIVER_USER"),
      emailAddress: process.env.LIGHTSPARK_UMA_RECEIVER_USER_EMAIL,
      name: process.env.LIGHTSPARK_UMA_RECEIVER_USER_NAME,
      kycStatus: KycStatus.Verified,
    });
  }

  async getCallingUserFromRequest(
    fullUrl: URL,
    headers: { [key: string]: string | string[] | undefined },
  ): Promise<User | undefined> {
    // TODO(Jeremy): Add authentication.
    return this.usersById.get(DEMO_UID);
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.usersById.get(userId);
  }

  async getUserByUma(umaAddress: string): Promise<User | undefined> {
    return Array.from(this.usersById.values()).find(
      (u) => u.umaUserName === umaAddress || `$${u.umaUserName}` == umaAddress,
    );
  }

  async getCurrencyPreferencesForUser(
    userId: string,
  ): Promise<Currency[] | undefined> {
    // Implementation note: In a real VASP, you'd probably inject a CurrencyService into the UserService
    // to pull out exchange rates for each supported currency. For the demo, we'll just hard-code sats.
    return [
      {
        symbol: "sat",
        code: "SAT",
        name: "Satoshis",
        maxSendable: 10_000_000_000,
        minSendable: 1,
        multiplier: 1000,
        decimals: 0,
      },
    ];
  }
}
