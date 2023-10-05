import { wasm_handle_remote_signing_webhook_event } from "../crypto.cjs";
import { hexToBytes } from "@lightsparkdev/core";

describe("crypto", () => {
  it("wasm_handle_remote_signing_webhook_event should decrypt the webhook data", () => {
    const dataHex =
      "7b226576656e745f74797065223a202252454d4f54455f5349474e494e47222c20226576656e745f6964223a20223530353364626438633562303435333439346631633134653031646136396364222c202274696d657374616d70223a2022323032332d30392d31385432333a35303a31352e3335353630332b30303a3030222c2022656e746974795f6964223a20226e6f64655f776974685f7365727665725f7369676e696e673a30313861393633352d333637332d383864662d303030302d383237663233303531623139222c202264617461223a207b227375625f6576656e745f74797065223a202245434448222c2022626974636f696e5f6e6574776f726b223a202252454754455354222c2022706565725f7075626c69635f6b6579223a2022303331373364393764303937336435393637313663386364313430363665323065323766363836366162323134666430346431363033303136313564653738663732227d7d";
    const dataBytes = hexToBytes(dataHex);
    const sig =
      "a64c69f1266bc1dc1322c3f40eba7ba2d536c714774a4fc04f0938609482f5d9";
    const webhookSecret = "39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws";
    const seed =
      "1a6deac8f74fb2e332677e3f4833b5e962f80d153fb368b8ee322a9caca4113d56cccd88f1c6a74e152669d8cd373fee2f27e3645d80de27640177a8c71395f8";
    const seedBytes = hexToBytes(seed);
    const validator = {
      should_sign: (webhook: string) => true,
    };
    const res = wasm_handle_remote_signing_webhook_event(
      dataBytes,
      sig,
      webhookSecret,
      seedBytes,
      validator
    );

    const variables = JSON.parse(res.variables);
    expect(res.query).toMatch(/^mutation UpdateNodeSharedSecret/);
    expect(variables.node_id).toEqual(
      "node_with_server_signing:018a9635-3673-88df-0000-827f23051b19"
    );
    expect(variables.shared_secret).toEqual(
      "85ae1d8a548e2f96667dc8f63e7201ed16fb1bc7248c7aae6ea6fb76d244f74b"
    );
  });
});
