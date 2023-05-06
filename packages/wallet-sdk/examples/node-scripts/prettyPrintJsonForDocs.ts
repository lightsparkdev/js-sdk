#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  InMemoryJwtStorage,
  LightsparkClient,
} from "@lightsparkdev/wallet-sdk";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const credentials = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  undefined,
  "api.dev.dev.sparkinfra.net"
);
await client.loginWithJWT(credentials.accountId, credentials.jwt, new InMemoryJwtStorage());

const makeRequest = async () => {
  // Replace this function's contents with whatever type you want to fetch.
  return await client.getCurrentWallet();
};

const oneLineAmounts = (initialJson: string) => {
  const regex = RegExp(
    /\{\n\s+"value": (\d+),\n\s+"unit": "(\w+)"\n\s*\}(,?)/g
  );
  return initialJson.replace(regex, (match, p1, p2, p3) => {
    return `{ "value": ${p1}, "unit": "${p2}" }${p3}`;
  });
};

const shortenStrings = (initialJson: string) => {
  const regex = RegExp(/"([\w\+\/\=]{35,})"/g);
  return initialJson.replace(regex, (match, p1) => {
    return `"${p1.substring(0, 7)}...${p1.substring(p1.length - 7)}"`;
  });
};

const camelCaseKeys = (initialJson: string) => {
  const regex = RegExp(/"(\w+)":/g);
  return initialJson.replace(regex, (match, p1) => {
    return match.replace(
      p1,
      p1.replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`)
    );
  });
};

// TODO: It would be good to also fix the fact that JS generates nested entities like
// `"desitnation_id": "blah"` instead of `"destination": { "id": "blah"}`.
makeRequest().then((result) => {
  console.log(
    camelCaseKeys(
      shortenStrings(oneLineAmounts(JSON.stringify(result, null, 2)))
    )
  );
});
