import jwt from "jsonwebtoken";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Level } from "level";
import * as crypto from "crypto";

const env = dotenv.config({
  path: process.env.HOME + "/.lightsparkenv",
}).parsed || {};
const accountId = env["LIGHTSPARK_ACCOUNT_ID"];
const privateSigningKey = env["LIGHTSPARK_JWT_PRIV_KEY"];

if (!accountId || !privateSigningKey) {
  throw new Error(
    "Missing account config. Please run lightspark-wallet init-env to configure your account locally." +
    "See: https://docs.lightspark.com/wallet-sdk/wallet-cli",
  );
}

const db = new Level("./mydb", { valueEncoding: "json" });

const app = express();
app.use(cors());

app.get("/getJwt", (req, res) => {
  handleGetJwt(req, res).catch((err) => {
    res.status(500).send(err);
  });
});

app.listen(3000);

const handleGetJwt = async (req: express.Request, res: express.Response) => {
  const userId = req.query.userId as string;
  const password = req.query.password as string;
  res.set("Access-Control-Allow-Origin", "*");
  if (!userId || !password) {
    res.status(400).send("Missing userId or password");
    return;
  }

  const isUserValid = await checkOrCreateUser(userId, password);
  if (!isUserValid) {
    res.status(401).send("Invalid userId+password combo");
    return;
  }

  const claims = {
    aud: "https://api.lightspark.com",
    // Any unique identifier for the user.
    sub: userId,
    // True to use the test environment, false to use production.
    test: true,
    iat: Math.floor(Date.now() / 1000),
    // Expiration time for the JWT is 30 days from now.
    exp: Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000),
  };
  console.log("claims", claims);

  console.log(`jwt: ${JSON.stringify(Object.entries(jwt))}`);
  const token = jwt.sign(claims, privateSigningKey, { algorithm: "ES256" });

  console.log("Generating JWT for a user", { userId, accountId });
  res.send({ token, accountId });
};

const checkOrCreateUser = async (userId: string, password: string) => {
  let existingUser;
  try {
    existingUser = await db.get(userId);
  } catch (err) {
    if ((err as { notFound: boolean }).notFound) {
      console.log("err", err);
      // Do nothing, this is expected if the user doesn't exist yet.
    } else {
      throw err;
    }
  }

  // If the user already exists, check that the derived key matches.
  if (existingUser) {
    const userData = JSON.parse(existingUser) as { key: string; salt: string };
    const key = crypto.scryptSync(password, userData.salt, 64).toString("base64");
    console.log("Existing user!", userId);
    return userData.key === key;
  }

  // Otherwise create a new user with a random salt and a key derived from the password.
  const salt = crypto.randomBytes(16).toString("base64");
  const key = crypto.scryptSync(password, salt, 64).toString("base64");
  console.log("New user!", userId);
  await db.put(userId, JSON.stringify({ key, salt }));
  return true;
};
