/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} webhook_data
* @param {string} webhook_signature
* @param {string} webhook_secret
* @param {Uint8Array} master_seed_bytes
* @param {any} validation
* @returns {RemoteSigningResponseWasm | undefined}
*/
export function wasm_handle_remote_signing_webhook_event(webhook_data: Uint8Array, webhook_signature: string, webhook_secret: string, master_seed_bytes: Uint8Array, validation: any): RemoteSigningResponseWasm | undefined;
/**
*/
export enum Network {
  Bitcoin = 0,
  Testnet = 1,
  Regtest = 2,
}
/**
*/
export class InvoiceSignature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  get_signature(): Uint8Array;
/**
* @returns {number}
*/
  get_recovery_id(): number;
}
/**
*/
export class LightsparkSigner {
  free(): void;
/**
* @param {Seed} seed
* @param {Network} network
* @returns {LightsparkSigner}
*/
  static new(seed: Seed, network: Network): LightsparkSigner;
/**
* @param {Uint8Array} seed
* @param {Network} network
* @returns {LightsparkSigner}
*/
  static from_bytes(seed: Uint8Array, network: Network): LightsparkSigner;
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
* @param {boolean} is_raw
* @param {Uint8Array | undefined} [add_tweak]
* @param {Uint8Array | undefined} [mul_tweak]
* @returns {Uint8Array}
*/
  derive_key_and_sign(message: Uint8Array, derivation_path: string, is_raw: boolean, add_tweak?: Uint8Array, mul_tweak?: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} public_key
* @returns {Uint8Array}
*/
  ecdh(public_key: Uint8Array): Uint8Array;
/**
* @param {string} derivation_path
* @param {bigint} per_commitment_point_idx
* @returns {Uint8Array}
*/
  get_per_commitment_point(derivation_path: string, per_commitment_point_idx: bigint): Uint8Array;
/**
* @param {string} derivation_path
* @param {bigint} per_commitment_point_idx
* @returns {Uint8Array}
*/
  release_per_commitment_secret(derivation_path: string, per_commitment_point_idx: bigint): Uint8Array;
/**
* @returns {Uint8Array}
*/
  generate_preimage_nonce(): Uint8Array;
/**
* @param {Uint8Array} nonce
* @returns {Uint8Array}
*/
  generate_preimage(nonce: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} nonce
* @returns {Uint8Array}
*/
  generate_preimage_hash(nonce: Uint8Array): Uint8Array;
/**
* @param {string} derivation_path
* @returns {string}
*/
  derive_private_key(derivation_path: string): string;
/**
* @param {string} derivation_path
* @returns {string}
*/
  derive_public_key_hex(derivation_path: string): string;
/**
* @param {string} unsigned_invoice
* @returns {InvoiceSignature}
*/
  sign_invoice_wasm(unsigned_invoice: string): InvoiceSignature;
/**
* @param {Uint8Array} invoice_hash
* @returns {InvoiceSignature}
*/
  sign_invoice_hash_wasm(invoice_hash: Uint8Array): InvoiceSignature;
}
/**
*/
export class Mnemonic {
  free(): void;
/**
* @returns {Mnemonic}
*/
  static random(): Mnemonic;
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
export class RemoteSigningResponseWasm {
  free(): void;
/**
*/
  query: string;
/**
*/
  variables: string;
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
