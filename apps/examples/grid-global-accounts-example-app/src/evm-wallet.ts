// EVM wallet helpers: the signer shape the EVM_WALLET flows use, and recovery
// of a wallet's secp256k1 public key from a `personal_sign` signature.

import { hashMessage, isAddressEqual, recoverPublicKey, type Hex } from "viem";
import { publicKeyToAddress } from "viem/accounts";

/** An EVM wallet as the Grid flows use it: its address and `personal_sign`. */
export interface EvmSigner {
  address: Hex;
  /** EIP-191 `personal_sign` over the exact string given. */
  signMessage: (message: string) => Promise<Hex>;
}

/** What a new owner's wallet signs so its public key can be recovered. It grants nothing. */
export const OWNER_KEY_MESSAGE =
  "Share this wallet's public key so it can be added as an owner of a Grid Global Account.\n\nThis signature authorizes nothing.";

/**
 * Recover the signer's secp256k1 key from a `personal_sign` signature, as
 * compressed `0x`-hex. Wallets expose an address, not a key, and
 * `POST /auth/admin-credentials` takes the key.
 */
export async function recoverCompressedPublicKey(
  message: string,
  signature: Hex,
  address: Hex,
): Promise<Hex> {
  const uncompressed = await recoverPublicKey({
    hash: hashMessage(message),
    signature,
  });
  if (!isAddressEqual(publicKeyToAddress(uncompressed), address))
    throw new Error(`The signature was not made by ${address}.`);
  const x = uncompressed.slice(4, 68);
  const yIsEven = parseInt(uncompressed.slice(-2), 16) % 2 === 0;
  return `0x${yIsEven ? "02" : "03"}${x}`;
}

/** Derived from the address, so one wallet always maps to one administrator. */
export function adminReferenceFor(address: string): string {
  return `member_${address.slice(2, 10).toLowerCase()}`;
}

/** An EVM credential's nickname is its address, in whatever case Grid stored. */
export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
