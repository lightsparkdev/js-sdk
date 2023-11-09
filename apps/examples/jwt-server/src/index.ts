import {
  verifyAndParseWebhook,
  WEBHOOKS_SIGNATURE_HEADER,
} from "@lightsparkdev/lightspark-sdk";
import { createHash } from "crypto";
import { initializeApp } from "firebase-admin/app";
import * as firestore from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import jwt from "jsonwebtoken";

initializeApp();

const accountIdParam = defineString("ACCOUNT_ID");
const privateSigningKeyParam = defineSecret("ACCOUNT_PRIVATE_SIGNING_KEY");
const webhookSecretParam = defineSecret("WEBHOOK_SECRET");

export const getJwt = onRequest(
  { cors: true, secrets: [privateSigningKeyParam] },
  async (request, response) => {
    const userId = request.query.userId as string;
    const password = request.query.password as string;
    response.set("Access-Control-Allow-Origin", "*");
    if (!userId || !password) {
      response.status(400).send("Missing userId or password");
      return;
    }

    const isUserValid = await checkOrCreateUser(userId, password);
    if (!isUserValid) {
      response.status(401).send("Invalid userId+password combo");
      return;
    }

    const accountId = accountIdParam.value();
    const privateSigningKey = privateSigningKeyParam.value();
    if (!accountId || !privateSigningKey) {
      response
        .status(500)
        .send(
          "Missing account config. Please add account_id and " +
            "private_signing_key to the firebase config.",
        );
      return;
    }

    const claims = {
      aud: "https://api.lightspark.com",
      // Any unique identifier for the user.
      sub: userId,
      // True to use the test environment, false to use production.
      test: true,
      iat: Math.floor(Date.now() / 1000),
      // Expriation time for the JWT is 30 days from now.
      exp: Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000),
    };
    console.log("claims", claims);

    console.log(`jwt: ${JSON.stringify(Object.entries(jwt))}`);
    const token = jwt.sign(claims, privateSigningKey, { algorithm: "ES256" });

    logger.info("Generating JWT for a user", { userId, accountId });
    response.send({ token, accountId });
  },
);

export const handleWebhook = onRequest(
  { cors: true, secrets: [webhookSecretParam] },
  async (request, response) => {
    const hexdigest = request.header(WEBHOOKS_SIGNATURE_HEADER) || "";
    const bodyData = new TextEncoder().encode(JSON.stringify(request.body));
    const event = await verifyAndParseWebhook(
      bodyData,
      hexdigest,
      webhookSecretParam.value(),
    );
    console.log(`Received webhook event: ${event.event_type}`);
    console.log(`Event data: ${JSON.stringify(event)}`);

    // From here, you could take some action based on the event type. For example:
    // if (event.event_type === WebhookEventType.WALLET_INCOMING_PAYMENT_FINISHED) {
    //   const payment = await lightsparkClient.executeRawQuery(
    //       IncomingPayment.getIncomingPaymentQuery(event.entity_id)
    //   );
    //   console.log(`Incoming payment: ${JSON.stringify(payment)}`);
    //   const wallet = await lightsparkClient.executeRawQuery(Wallet.getWalletQuery(payment.wallet_id));
    //   await sendPaymentReceivedNotification(wallet.thirdPartyIdentifier, payment.amount);
    // }

    response.send("ok");
  },
);

const checkOrCreateUser = async (userId: string, password: string) => {
  const hash = createHash("sha256");
  const hashedPassword = hash.update(password).digest("base64");
  const existingUser = await firestore
    .getFirestore()
    .doc(`users/${userId}`)
    .get();
  if (existingUser.exists) {
    const userData = existingUser.data();
    return userData?.passwordHash === hashedPassword;
  }

  await firestore.getFirestore().doc(`users/${userId}`).set({
    passwordHash: hashedPassword,
  });
  return true;
};
