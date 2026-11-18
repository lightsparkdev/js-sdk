// EVM wallet helpers: the signer shape the EVM_WALLET flows use.

import type { Hex } from "viem";

/** An EVM wallet as the Grid flows use it: its address and `personal_sign`. */
export interface EvmSigner {
  address: Hex;
  /** EIP-191 `personal_sign` over the exact string given. */
  signMessage: (message: string) => Promise<Hex>;
}

/** An EVM credential's nickname is its address, in whatever case Grid stored. */
export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
