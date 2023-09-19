/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_mnemonic_free(a: number): void;
export function mnemonic_random(a: number): void;
export function mnemonic_from_entropy(a: number, b: number, c: number): void;
export function mnemonic_from_phrase(a: number, b: number, c: number): void;
export function mnemonic_as_string(a: number, b: number): void;
export function __wbg_seed_free(a: number): void;
export function seed_from_mnemonic(a: number): number;
export function seed_new(a: number, b: number): number;
export function __wbg_invoicesignature_free(a: number): void;
export function invoicesignature_get_signature(a: number, b: number): void;
export function invoicesignature_get_recovery_id(a: number): number;
export function __wbg_lightsparksigner_free(a: number): void;
export function lightsparksigner_new(a: number, b: number, c: number): void;
export function lightsparksigner_from_bytes(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_get_master_public_key(
  a: number,
  b: number,
): void;
export function lightsparksigner_derive_public_key(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_derive_key_and_sign(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
): void;
export function lightsparksigner_ecdh(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_get_per_commitment_point(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;
export function lightsparksigner_release_per_commitment_secret(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;
export function lightsparksigner_generate_preimage_nonce(
  a: number,
  b: number,
): void;
export function lightsparksigner_generate_preimage(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_generate_preimage_hash(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_derive_private_key(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_sign_invoice_wasm(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function lightsparksigner_sign_invoice_hash_wasm(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function seed_as_bytes(a: number, b: number): void;
export function rustsecp256k1_v0_8_1_context_create(a: number): number;
export function rustsecp256k1_v0_8_1_context_destroy(a: number): void;
export function rustsecp256k1_v0_8_1_default_illegal_callback_fn(
  a: number,
  b: number,
): void;
export function rustsecp256k1_v0_8_1_default_error_callback_fn(
  a: number,
  b: number,
): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(
  a: number,
  b: number,
  c: number,
  d: number,
): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
