import { KycStatus } from "@uma-sdk/core";
import { requireEnv } from "../UmaConfig.js";
import { User } from "../User.js";
import UserService from "../UserService.js";

// Static UUID so that callback URLs are always the same.
const DEMO_UID = "4b41ae03-01b8-4974-8d26-26a35d28851b";
const DEMO_SPARK_IDENTITY_PUBKEY =
  "0299e77e9b1559400d8b8db238173ed7065148b30a15d4bf3d09195e69608e8817";

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
      sparkIdentityPubkey: DEMO_SPARK_IDENTITY_PUBKEY,
    });
  }

  async getCallingUserFromRequest(
    fullUrl: URL,
    headers: { [key: string]: string | string[] | undefined },
  ): Promise<User | undefined> {
    // Using basic auth with a static username/password for demo purposes.
    const basicAuthHeader = headers["authorization"];
    if (
      !basicAuthHeader ||
      typeof basicAuthHeader !== "string" ||
      !basicAuthHeader.startsWith("Basic ")
    ) {
      return undefined;
    }
    const usernameAndPassword = basicAuthHeader.split(" ")[1];
    if (!usernameAndPassword) {
      return undefined;
    }
    const [username, password] = Buffer.from(usernameAndPassword, "base64")
      .toString("utf8")
      .split(":");
    if (!username || !password) {
      return undefined;
    }
    if (username !== requireEnv("LIGHTSPARK_UMA_RECEIVER_USER")) {
      return undefined;
    }
    if (password !== requireEnv("LIGHTSPARK_UMA_RECEIVER_USER_PASSWORD")) {
      return undefined;
    }

    return this.usersById.get(DEMO_UID);
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.usersById.get(userId);
  }

  async getUserByUma(umaAddress: string): Promise<User | undefined> {
    // Intentionally looking for the uma address both with and without the `$` prefix to
    // support lightning addresses. See https://docs.uma.me/uma-standard/uma-addresses#lightning-address-inter-op.
    return Array.from(this.usersById.values()).find(
      (u) => u.umaUserName === umaAddress || `$${u.umaUserName}` == umaAddress,
    );
  }

  async getReceivableMsatsRangeForUser(
    userId: string,
  ): Promise<[number, number]> {
    return [1, 100_000_000];
  }
}
