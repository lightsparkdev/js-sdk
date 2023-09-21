import { createSha256Hash } from "@lightsparkdev/core";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import {
  encodeToUrl,
  getSignableLnurlpRequestPayload,
  type LnurlpRequest,
  type PubKeyResponse,
} from "./protocol.js";
import { type PublicKeyCache } from "./PublicKeyCache.js";
import { isVersionSupported, UmaProtocolVersion } from "./version.js";

export type ParsedLnurlpRequest = {
  vaspDomain: string;
  umaVersion: string;
  signature: string;
  receiverAddress: string;
  nonce: string;
  timestamp: Date;
  isSubjectToTravelRule: boolean;
};

export function parseLnurlpRequest(url: URL) {
  const query = url.searchParams;
  const signature = query.get("signature");
  const vaspDomain = query.get("vaspDomain");
  const nonce = query.get("nonce");
  const isSubjectToTravelRule = query.get("isSubjectToTravelRule");
  const umaVersion = query.get("umaVersion");
  const timestamp = query.get("timestamp");

  if (!vaspDomain || !signature || !nonce || !timestamp || !umaVersion) {
    throw new Error(
      "missing uma query parameters. vaspDomain, umaVersion, signature, nonce, and timestamp are required",
    );
  }

  const timestampUnixSeconds = parseInt(timestamp, 10);
  /* Date expects milliseconds: */
  const timestampAsTime = new Date(timestampUnixSeconds * 1000);

  const pathParts = url.pathname.split("/");
  if (
    pathParts.length != 4 ||
    pathParts[1] != ".well-known" ||
    pathParts[2] != "lnurlp"
  ) {
    throw new Error("invalid uma request path");
  }
  const receiverAddress = pathParts[3] + "@" + url.host;

  if (!isVersionSupported(umaVersion)) {
    throw new Error("unsupported uma version");
  }

  return {
    vaspDomain,
    umaVersion,
    signature,
    receiverAddress,
    nonce,
    timestamp: timestampAsTime,
    isSubjectToTravelRule: Boolean(
      isSubjectToTravelRule?.toLowerCase() == "true",
    ),
  };
}

// Checks if the given URL is a valid UMA request.
export function isUmaLnurlpQuery(url: URL) {
  let query: null | ParsedLnurlpRequest = null;
  try {
    query = parseLnurlpRequest(url);
  } catch {
    return false;
  }
  return query !== null;
}

export function generateNonce() {
  return Number(crypto.getRandomValues(new Uint32Array(1)));
}

/* fetchPublicKeyForVasp fetches the public key for another VASP.

If the public key is not in the cache, it will be fetched from the VASP's domain.
The public key will be cached for future use.

Args:
vaspDomain: the domain of the VASP.
cache: the PublicKeyCache cache to use. You can use the InMemoryPublicKeyCache struct, or implement your own persistent cache with any storage type. */
export async function fetchPublicKeyForVasp(
  vaspDomain: string,
  cache: PublicKeyCache,
): Promise<PubKeyResponse> {
  const publicKey = cache.fetchPublicKeyForVasp(vaspDomain);
  if (publicKey) {
    return Promise.resolve(publicKey);
  }

  let scheme = "https://";
  if (vaspDomain.startsWith("localhost:")) {
    scheme = "http://";
  }

  const response = await fetch(
    scheme + vaspDomain + "/.well-known/lnurlpubkey",
  );
  if (response.status != 200) {
    if (response.status !== 200) {
      return Promise.reject(new Error("invalid response from VASP"));
    }
  }
  const pubKeyResponse = await response.json();
  cache.addPublicKeyForVasp(vaspDomain, pubKeyResponse);
  return pubKeyResponse;
}

/* getSignedLnurlpRequestUrl Creates a signed uma request URL.

Args:

signingPrivateKey: the private key of the VASP that is sending the payment. This will be used to sign the request.
receiverAddress: the address of the receiver of the payment (i.e. $bob@vasp2).
senderVaspDomain: the domain of the VASP that is sending the payment. It will be used by the receiver to fetch the public keys of the sender.
isSubjectToTravelRule: whether the sending VASP is a financial institution that requires travel rule information.
umaVersionOverride: the version of the UMA protocol to use. If not specified, the latest version will be used. */

export async function getSignedLnurlpRequestUrl(
  signingPrivateKey: Uint8Array,
  receiverAddress: string,
  senderVaspDomain: string,
  isSubjectToTravelRule: boolean,
  umaVersionOverride?: string,
) {
  const nonce = generateNonce();
  const umaVersion = umaVersionOverride ?? UmaProtocolVersion;
  const unsignedRequest: LnurlpRequest = {
    receiverAddress,
    isSubjectToTravelRule,
    vaspDomain: senderVaspDomain,
    timestamp: new Date(),
    nonce: String(nonce),
    signature: "",
    umaVersion,
  };

  const payload = getSignableLnurlpRequestPayload(unsignedRequest);

  const signature = await signPayload(payload, signingPrivateKey);
  unsignedRequest.signature = signature;
  return encodeToUrl(unsignedRequest);
}

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(payload: string, privateKeyBytes: Uint8Array) {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(payload);
  const hashedPayload = await createSha256Hash(encodedPayload);

  const { signature } = secp256k1.ecdsaSign(hashedPayload, privateKeyBytes);
  return uint8ArrayToHexString(signature);
}

export async function verifyUmaLnurlpQuerySignature(
  query: LnurlpRequest,
  otherVaspSigningPubKey: Uint8Array,
) {
  const payload = getSignableLnurlpRequestPayload(query);
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(payload);
  const hashedPayload = await createSha256Hash(encodedPayload);
  return verifySignature(
    hashedPayload,
    query.signature,
    otherVaspSigningPubKey,
  );
}

function verifySignature(
  hashedPayload: Uint8Array,
  signature: string,
  otherVaspPubKey: Uint8Array,
) {
  const decodedSignature = Buffer.from(signature, "hex");

  const verified = secp256k1.ecdsaVerify(
    decodedSignature,
    hashedPayload,
    otherVaspPubKey,
  );
  return verified;
}

export function isValidUmaAddress(umaAddress: string) {
  if (!umaAddress.startsWith("$")) {
    return false;
  }

  const addressParts = umaAddress.split("@");
  if (addressParts.length != 2) {
    return false;
  }

  const userName = addressParts[0].slice(1);
  if (!userName.match(/^[a-z0-9-_\.\+]+$/i)) {
    return false;
  }

  if (userName.length > 64) {
    return false;
  }

  return true;
}

export function getVaspDomainFromUmaAddress(umaAddress: string) {
  if (!isValidUmaAddress(umaAddress)) {
    throw new Error("invalid uma address");
  }
  const addressParts = umaAddress.split("@");
  return addressParts[1];
}
