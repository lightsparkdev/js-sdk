import { NetworkType } from "@buildonspark/spark-sdk";
import { decodeSparkAddress } from "@buildonspark/spark-sdk/address";
import { User } from "../User.js";
import UserService from "../UserService.js";

export default class SparkAddressUserService implements UserService {
  async getCallingUserFromRequest(
    fullUrl: URL,
    headers: { [key: string]: string | string[] | undefined },
  ): Promise<User | undefined> {
    // Sending not supported for now, so no need to have auth.
    return undefined;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const network = SparkAddressUserService.getNetworkForSparkAddress(userId);
    if (!network) {
      return undefined;
    }
    try {
      return {
        sparkAddress: userId,
        umaUserName: userId,
        sparkIdentityPubKey: decodeSparkAddress(userId, network),
      };
    } catch (e) {
      // Invalid spark address, return undefined
      return undefined;
    }
  }

  async getUserByUma(umaAddress: string): Promise<User | undefined> {
    // Intentionally looking for the uma address both with and without the `$` prefix to
    // support lightning addresses. See https://docs.uma.me/uma-standard/uma-addresses#lightning-address-inter-op.
    if (umaAddress.startsWith("$")) {
      umaAddress = umaAddress.slice(1);
    }
    return this.getUserById(umaAddress.replace(/@.*$/, ""));
  }

  static getNetworkForSparkAddress(
    sparkAddress: string,
  ): NetworkType | undefined {
    if (sparkAddress.startsWith("sprt")) {
      return "REGTEST";
    }
    if (sparkAddress.startsWith("spt")) {
      return "TESTNET";
    }
    if (sparkAddress.startsWith("sps")) {
      return "SIGNET";
    }
    if (sparkAddress.startsWith("spl")) {
      return "LOCAL";
    }
    if (sparkAddress.startsWith("sp")) {
      return "MAINNET";
    }
    return undefined;
  }

  async getReceivableMsatsRangeForUser(
    userId: string,
  ): Promise<[number, number]> {
    return [1, 100_000_000_000];
  }
}
