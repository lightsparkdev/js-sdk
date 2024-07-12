import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import LightsparkClient from "../client.js";
import { getCredentialsFromEnvOrThrow } from "../env.js";
import { AccountTokenAuthProvider } from "../index.js";
import { TESTS_TIMEOUT } from "./integration/constants.js";

const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
  getCredentialsFromEnvOrThrow();

const accountAuthProvider = new AccountTokenAuthProvider(
  apiTokenClientId,
  apiTokenClientSecret,
);

const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

describe("UmaUtils", () => {
  beforeEach(() => {
    jest.spyOn(lightsparkClient, "getUtcDateTime");
  });

  test(
    "Should return same uma identifier hash for same month",
    async () => {
      const privKeyBytes = Buffer.from("xyz");
      (lightsparkClient.getUtcDateTime as jest.Mock).mockReturnValue(
        new Date(Date.UTC(2021, 0, 1, 0, 0, 0)),
      );
      const hashedUma = await lightsparkClient.hashUmaIdentifier(
        "user@domain.com",
        privKeyBytes,
      );
      const hashedUmaSameMonth = await lightsparkClient.hashUmaIdentifier(
        "user@domain.com",
        privKeyBytes,
      );

      expect(hashedUmaSameMonth).toStrictEqual(hashedUma);
      console.log(hashedUma);
    },
    TESTS_TIMEOUT,
  );

  test(
    "Should return different uma identifier hash for different months",
    async () => {
      const privKeyBytes = Buffer.from("xyz");
      (lightsparkClient.getUtcDateTime as jest.Mock).mockReturnValue(
        new Date(Date.UTC(2021, 0, 1, 0, 0, 0)),
      );
      const hashedUma = await lightsparkClient.hashUmaIdentifier(
        "user@domain.com",
        privKeyBytes,
      );

      (lightsparkClient.getUtcDateTime as jest.Mock).mockReturnValue(
        new Date(Date.UTC(2021, 1, 1, 0, 0, 0)),
      );
      const hashedUmaNewMonth = await lightsparkClient.hashUmaIdentifier(
        "user@domain.com",
        privKeyBytes,
      );

      expect(hashedUmaNewMonth).not.toStrictEqual(hashedUma);
      console.log(hashedUma);
      console.log(hashedUmaNewMonth);
    },
    TESTS_TIMEOUT,
  );
});
