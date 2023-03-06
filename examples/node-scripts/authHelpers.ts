export const getCredentialsFromEnvOrThrow = () => {
  const clientId = process.env["LIGHTSPARK_TOKEN_ID"];
  const clientSecret = process.env["LIGHTSPARK_TOKEN"];
  const walletNodeId = process.env["LIGHTSPARK_WALLET_NODE_ID"];
  const node1Name = process.env["LIGHTSPARK_EXAMPLE_NODE_1_NAME"];
  const node1Password = process.env["LIGHTSPARK_EXAMPLE_NODE_1_PASSWORD"];
  const node2Name = process.env["LIGHTSPARK_EXAMPLE_NODE_2_NAME"];
  const node2Password = process.env["LIGHTSPARK_EXAMPLE_NODE_2_PASSWORD"];
  if (!clientId || !clientSecret || !walletNodeId) {
    throw new Error(
      "Missing test credentials. Please set LS_TOKEN_ID, LS_TOKEN, and LS_WALLET_NODE_ID environment variables."
    );
  }
  return {
    clientId,
    clientSecret,
    walletNodeId,
    node1Name,
    node1Password,
    node2Name,
    node2Password,
  };
};
