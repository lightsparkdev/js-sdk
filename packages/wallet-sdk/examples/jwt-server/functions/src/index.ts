import { createHash } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as jwt from "jsonwebtoken";

admin.initializeApp();

export const getJwt = functions.https.onRequest(async (request, response) => {
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

  const accountId = functions.config().account.id;
  const privateSigningKey = functions.config().account.private_signing_key;
  console.log("account", accountId, privateSigningKey);
  if (!accountId || !privateSigningKey) {
    response
      .status(500)
      .send(
        "Missing account config. Please add account_id and " +
          "private_signing_key to the firebase config."
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

  const token = jwt.sign(claims, privateSigningKey, { algorithm: "ES256" });

  functions.logger.info("Generating JWT for a user", { userId, accountId });
  response.send({ token, accountId });
});

const checkOrCreateUser = async (userId: string, password: string) => {
  const hash = createHash("sha256");
  const hashedPassword = hash.update(password).digest("base64");
  const existingUser = await admin.firestore().doc(`users/${userId}`).get();
  if (existingUser.exists) {
    const userData = existingUser.data();
    return userData?.passwordHash === hashedPassword;
  }

  await admin.firestore().doc(`users/${userId}`).set({
    passwordHash: hashedPassword,
  });
  return true;
};
