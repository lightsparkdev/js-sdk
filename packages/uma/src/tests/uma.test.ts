import { isError } from "@lightsparkdev/core";
import {
  AccountTokenAuthProvider,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/lightspark-sdk/env";
import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";
import { UmaClient } from "../client.js";
import { dateToUnixSeconds } from "../protocol.js";
import {
  getSignedLnurlpRequestUrl,
  getVaspDomainFromUmaAddress,
  isUmaLnurlpQuery,
  isValidUmaAddress,
  parseLnurlpRequest,
  verifyUmaLnurlpQuerySignature,
} from "../uma.js";
import { UmaProtocolVersion } from "../version.js";

const generateKeypair = async () => {
  let privateKey: Buffer;
  do {
    privateKey = randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privateKey));

  const publicKey = secp256k1.publicKeyCreate(privateKey, false);

  return {
    privateKey,
    publicKey,
  };
};

describe("uma", () => {
  it("should construct the UMA client", () => {
    const credentials = getCredentialsFromEnvOrThrow();
    const lightsparkClient = new LightsparkClient(
      new AccountTokenAuthProvider(
        credentials.apiTokenClientId,
        credentials.apiTokenClientSecret,
      ),
      credentials.baseUrl,
    );
    const umaClient = new UmaClient({
      provider: lightsparkClient,
    });
    expect(umaClient).toBeTruthy();
  });

  it("parses a valid lnurlp request", () => {
    const expectedTime = new Date("2023-07-27T22:46:08Z");
    const timeSec = dateToUnixSeconds(expectedTime);
    const expectedQuery = {
      receiverAddress: "bob@vasp2",
      signature: "signature",
      isSubjectToTravelRule: true,
      nonce: "12345",
      timestamp: expectedTime,
      vaspDomain: "vasp1",
      umaVersion: "0.1",
    };
    const urlString =
      "https://vasp2/.well-known/lnurlp/bob?signature=signature&nonce=12345&vaspDomain=vasp1&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=" +
      timeSec;
    const urlObj = new URL(urlString);
    const query = parseLnurlpRequest(urlObj);
    expect(query).toEqual(expectedQuery);
  });

  it("validates uma queries", () => {
    const umaQuery =
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678";
    expect(isUmaLnurlpQuery(new URL(umaQuery))).toBeTruthy();
  });

  it("returns expected result for missing query params", () => {
    // Missing signature
    let url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    // Missing umaVersion
    url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&nonce=12345&vaspDomain=vasp1.com&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    // Missing nonce
    url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    // Missing vaspDomain
    url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&umaVersion=0.1&nonce=12345&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&umaVersion=0.1&nonce=12345&vaspDomain=vasp1.com&timestamp=12345678",
    );
    // IsSubjectToTravelRule is optional
    expect(isUmaLnurlpQuery(url)).toBe(true);

    // Missing timestamp
    url = new URL(
      "https://vasp2.com/.well-known/lnurlp/bob?signature=signature&nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    // Missing all required params
    url = new URL("https://vasp2.com/.well-known/lnurlp/bob");
    expect(isUmaLnurlpQuery(url)).toBe(false);
  });

  it("should be invalid uma query when url path is invalid", () => {
    let url = new URL(
      "https://vasp2.com/.well-known/lnurla/bob?signature=signature&nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    url = new URL(
      "https://vasp2.com/bob?signature=signature&nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);

    url = new URL(
      "https://vasp2.com/?signature=signature&nonce=12345&vaspDomain=vasp1.com&umaVersion=0.1&isSubjectToTravelRule=true&timestamp=12345678",
    );
    expect(isUmaLnurlpQuery(url)).toBe(false);
  });

  it("should validate valid uma addresses", () => {
    expect(isValidUmaAddress("$bob@lighspark.com")).toBe(true);
    expect(isValidUmaAddress("$BOb@lighspark.com")).toBe(true);
    expect(isValidUmaAddress("$BOb_+.somewhere@lighspark.com")).toBe(true);
    expect(isValidUmaAddress("$.@lightspark.com")).toBe(true);
    expect(isValidUmaAddress("$232358BOB@lightspark.com")).toBe(true);
    expect(
      isValidUmaAddress(
        "$therearelessthan65charactersinthisusername1234567891234567891234@lightspark.com",
      ),
    ).toBe(true);
  });

  it("should validate invalid uma addresses", () => {
    expect(isValidUmaAddress("$@lighspark.com")).toBe(false);
    expect(isValidUmaAddress("bob@lightspark.com")).toBe(false);
    expect(isValidUmaAddress("bob@lightspark")).toBe(false);
    expect(isValidUmaAddress("$%@lightspark.com")).toBe(false);
    expect(
      isValidUmaAddress(
        "$therearemorethan64charactersinthisusername12345678912345678912345@lightspark.com",
      ),
    ).toBe(false);
  });

  it("should get the vasp domain from an uma address", () => {
    expect(getVaspDomainFromUmaAddress("$bob@lightspark.com")).toEqual(
      "lightspark.com",
    );
  });

  it("should sign and verify lnurlp request", async () => {
    const { privateKey, publicKey } = await generateKeypair();
    const queryUrl = await getSignedLnurlpRequestUrl(
      privateKey,
      "$bob@vasp2.com",
      "vasp1.com",
      true,
      undefined,
    );

    const query = parseLnurlpRequest(queryUrl);
    expect(query.umaVersion).toBe(UmaProtocolVersion);
    const verified = await verifyUmaLnurlpQuerySignature(query, publicKey);
    expect(verified).toBe(true);
  });

  it("should throw for incorrect public key", async () => {
    const { privateKey } = await generateKeypair();
    const { publicKey: incorrectPublicKey } = await generateKeypair();
    const queryUrl = await getSignedLnurlpRequestUrl(
      privateKey,
      "$bob@vasp2.com",
      "vasp1.com",
      true,
      undefined,
    );

    const query = parseLnurlpRequest(queryUrl);
    expect(query.umaVersion).toBe(UmaProtocolVersion);
    const verified = await verifyUmaLnurlpQuerySignature(
      query,
      incorrectPublicKey,
    );
    expect(verified).toBe(false);
  });

  it("should throw for invalid public key", async () => {
    const { privateKey, publicKey } = await generateKeypair();
    const queryUrl = await getSignedLnurlpRequestUrl(
      privateKey,
      "$bob@vasp2.com",
      "vasp1.com",
      true,
      undefined,
    );

    const query = parseLnurlpRequest(queryUrl);
    expect(query.umaVersion).toBe(UmaProtocolVersion);
    /* see https://bit.ly/3Zov3ZA */
    publicKey[0] = 0x01;
    try {
      await verifyUmaLnurlpQuerySignature(query, publicKey);
    } catch (e) {
      if (!isError(e)) {
        throw new Error("Invalid error type");
      }
      expect(e.message).toMatch(/Public Key could not be parsed/);
    }
  });
});
