/* tslint:disable */
/* eslint-disable */
/**
*/
export class LightsparkSigner {
  free(): void;
/**
* @param {Seed} seed
* @returns {LightsparkSigner}
*/
  static new(seed: Seed): LightsparkSigner;
/**
* @param {Uint8Array} seed
* @returns {LightsparkSigner}
*/
  static from_bytes(seed: Uint8Array): LightsparkSigner;
/**
* @returns {string}
*/
  get_master_public_key(): string;
/**
* @param {string} derivation_path
* @returns {string}
*/
  derive_public_key(derivation_path: string): string;
/**
* @param {Uint8Array} message
* @param {string} derivation_path
* @param {Uint8Array | undefined} add_tweak
* @param {Uint8Array | undefined} mul_tweak
* @returns {Uint8Array}
*/
  derive_key_and_sign(message: Uint8Array, derivation_path: string, add_tweak?: Uint8Array, mul_tweak?: Uint8Array): Uint8Array;
/**
* @param {string} public_key
* @returns {Uint8Array}
*/
  ecdh(public_key: string): Uint8Array;
/**
* @param {string} unsigned_invoice
* @returns {Uint8Array}
*/
  sign_invoice(unsigned_invoice: string): Uint8Array;
/**
* @param {bigint} channel
* @param {bigint} per_commitment_point_idx
* @returns {Uint8Array}
*/
  get_per_commitment_point(channel: bigint, per_commitment_point_idx: bigint): Uint8Array;
/**
* @param {bigint} channel
* @param {bigint} per_commitment_point_idx
* @returns {Uint8Array}
*/
  build_commitment_secret(channel: bigint, per_commitment_point_idx: bigint): Uint8Array;
}
/**
*/
export class Mnemonic {
  free(): void;
/**
* @returns {Mnemonic}
*/
  static new(): Mnemonic;
/**
* @param {Uint8Array} entropy
* @returns {Mnemonic}
*/
  static from_entropy(entropy: Uint8Array): Mnemonic;
/**
* @param {string} phrase
* @returns {Mnemonic}
*/
  static from_phrase(phrase: string): Mnemonic;
/**
* @returns {string}
*/
  as_string(): string;
}
/**
*/
export class Seed {
  free(): void;
/**
* @param {Mnemonic} mnemonic
* @returns {Seed}
*/
  static from_mnemonic(mnemonic: Mnemonic): Seed;
/**
* @param {Uint8Array} seed
* @returns {Seed}
*/
  static new(seed: Uint8Array): Seed;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
}
