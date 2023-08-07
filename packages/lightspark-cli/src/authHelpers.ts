// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export type EnvCredentials = {
  apiTokenClientId: string;
  apiTokenClientSecret: string;
  testNodePassword: string;
  baseUrl: string;
};

enum RequiredTestCredentials {
  ClientId = "LIGHTSPARK_API_TOKEN_CLIENT_ID",
  ClientSecret = "LIGHTSPARK_API_TOKEN_CLIENT_SECRET",
}

export const getCredentialsFromEnvOrThrow = (): EnvCredentials => {
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

  const apiTokenClientId = process.env[RequiredTestCredentials.ClientId]!;
  const apiTokenClientSecret =
    process.env[RequiredTestCredentials.ClientSecret]!;
  const testNodePassword = "1234!@#$";
  const baseUrl =
    process.env["LIGHTSPARK_EXAMPLE_BASE_URL"] || "api.lightspark.com";
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    testNodePassword,
    baseUrl,
  };
};
