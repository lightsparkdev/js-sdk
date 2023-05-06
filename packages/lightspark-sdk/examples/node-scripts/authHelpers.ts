// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const getCredentialsFromEnvOrThrow = () => {
  const apiTokenClientId = process.env["LIGHTSPARK_API_TOKEN_CLIENT_ID"];
  const apiTokenClientSecret =
    process.env["LIGHTSPARK_API_TOKEN_CLIENT_SECRET"];
  const nodePassword = process.env["LIGHTSPARK_TEST_NODE_PASSWORD"];
  const baseUrl = process.env["LIGHTSPARK_EXAMPLE_BASE_URL"] || "api.lightspark.com";
  if (!apiTokenClientId || !apiTokenClientSecret || !nodePassword) {
    throw new Error(
      "Missing test credentials. Please set LIGHTSPARK_API_TOKEN_CLIENT_ID, LIGHTSPARK_API_TOKEN_CLIENT_SECRET, and LIGHTSPARK_TEST_NODE_PASSWORD environment variables."
    );
  }
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    nodePassword,
    baseUrl
  };
};
