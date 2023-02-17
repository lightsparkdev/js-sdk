export const getCredentialsFromEnvOrThrow = () => {
  const clientId = process.env["LS_TOKEN_ID"];
  const clientSecret = process.env["LS_TOKEN"];
  const walletNodeId = process.env["LS_WALLET_NODE_ID"];
  if (!clientId || !clientSecret || !walletNodeId) {
    throw new Error(
      "Missing test credentials. Please set LS_TOKEN_ID, LS_TOKEN, and LS_WALLET_NODE_ID environment variables."
    );
  }
  return { clientId, clientSecret, walletNodeId };
};
