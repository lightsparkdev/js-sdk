// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

const enum RequiredTestCredentials {
  ClientId = "LIGHTSPARK_API_TOKEN_CLIENT_ID",
  ClientSecret = "LIGHTSPARK_API_TOKEN_CLIENT_SECRET",
  TestNodePassword = "LIGHTSPARK_TEST_NODE_PASSWORD",
}

export const getCredentialsFromEnvOrThrow = () => {
  const missingTestCredentials = Object.values(RequiredTestCredentials).filter(
    (cred) => !process.env[cred]
  );
  if (missingTestCredentials.length) {
    throw new Error(
      `Missing test credentials. Please set ${missingTestCredentials.join(
        ", "
      )} environment variables.`
    );
  }

  const apiTokenClientId = process.env[RequiredTestCredentials.ClientId];
  const apiTokenClientSecret =
    process.env[RequiredTestCredentials.ClientSecret];
  const nodePassword = process.env[RequiredTestCredentials.TestNodePassword];
  const baseUrl =
    process.env["LIGHTSPARK_EXAMPLE_BASE_URL"] || "api.lightspark.com";
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    nodePassword,
    baseUrl,
  };
};
