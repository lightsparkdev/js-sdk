// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const getCredentialsFromEnvOrThrow = () => {
  const apiTokenClientId = process.env["LIGHTSPARK_API_TOKEN_CLIENT_ID"];
  const apiTokenClientSecret =
    process.env["LIGHTSPARK_API_TOKEN_CLIENT_SECRET"];
  const walletNodeId = process.env["LIGHTSPARK_WALLET_NODE_ID"];
  const node1Name = process.env["LIGHTSPARK_EXAMPLE_NODE_1_NAME"];
  const node1Password = process.env["LIGHTSPARK_TEST_NODE_PASSWORD"];
  const node2Name = process.env["LIGHTSPARK_EXAMPLE_NODE_2_NAME"];
  const node2Password = process.env["LIGHTSPARK_EXAMPLE_NODE_2_PASSWORD"];
  if (!apiTokenClientId || !apiTokenClientSecret || !node1Password) {
    throw new Error(
      "Missing test credentials. Please set LIGHTSPARK_API_TOKEN_CLIENT_ID, LIGHTSPARK_API_TOKEN_CLIENT_SECRET, and LIGHTSPARK_TEST_NODE_PASSWORD environment variables."
    );
  }
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    walletNodeId,
    node1Name,
    node1Password,
    node2Name,
    node2Password,
  };
};
