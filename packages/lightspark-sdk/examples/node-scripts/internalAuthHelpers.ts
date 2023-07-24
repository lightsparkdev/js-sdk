// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

const enum RequiredTestCredentials {
  ClientId = "LIGHTSPARK_API_TOKEN_CLIENT_ID",
  ClientSecret = "LIGHTSPARK_API_TOKEN_CLIENT_SECRET",
  ExampleNodeOneName = "LIGHTSPARK_EXAMPLE_NODE_1_NAME",
  ExampleNodeTwoName = "LIGHTSPARK_EXAMPLE_NODE_2_NAME",
  ExampleNodeTwoPassword = "LIGHTSPARK_EXAMPLE_NODE_2_PASSWORD",
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
  const node1Name = process.env[RequiredTestCredentials.ExampleNodeOneName];
  const node2Name = process.env[RequiredTestCredentials.ExampleNodeTwoName];
  const node2Password =
    process.env[RequiredTestCredentials.ExampleNodeTwoPassword];

  return {
    apiTokenClientId,
    apiTokenClientSecret,
    node1Name,
    node2Name,
    node2Password,
  };
};
