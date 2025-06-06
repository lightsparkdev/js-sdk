# UMA Demo Server with Spark

An example UMA VASP server implementation using Typescript.

## Running the server

Configure environment variables needed for UMA messages (keys, etc.). Information on how to set them can be found in `src/UmaConfig.ts`.

Create a secp256k1 private key to use as your encryption private key (`LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY`) and use this private key to wrap the corresponding encryption public key in an X.509 Certificate (`LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN`). Similarly for signing, create a secp256k1 private key to use as your signing private key (`LIGHTSPARK_UMA_SIGNING_PRIVKEY`) and use this private key to wrap the corresponding signing public key in an X.509 Certificate (`LIGHTSPARK_UMA_SIGNING_CERT_CHAIN`). You may choose to use the same keypair for encryption and signing. For information on generating these, see [our docs](https://docs.uma.me/uma-standard/keys-authentication-encryption).

To run locally on your machine, from the `uma-vasp` directory, run:

```bash
yarn start
```

This will run the server on port 3104. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 yarn start
```

To set all of the config variables at once, you can do something like:

```bash
PORT=8080 \
LIGHTSPARK_UMA_RECEIVER_USER=bob \
LIGHTSPARK_UMA_RECEIVER_USER_PASSWORD=pa55w0rd \
LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN=<pem-encoded x509 certificate chain containing encryption pubkey> \
LIGHTSPARK_UMA_ENCRYPTION_PUBKEY=<encryption public key hex> \
LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY=<encryption private key hex> \
LIGHTSPARK_UMA_SIGNING_CERT_CHAIN=<pem-encoded x509 certificate chain containing signing pubkey> \
LIGHTSPARK_UMA_SIGNING_PUBKEY=<signing public key hex> \
LIGHTSPARK_UMA_SIGNING_PRIVKEY=<signing private key hex> \
yarn start
```

## Running with Docker

You can also run this server with Docker. First we need to build the image. From the root `js` directory, run:

```bash
docker build -t uma-vasp-js . -f apps/examples/uma-vasp/Dockerfile
```

Next, we need to set up the config variables. You can do this by creating a file called `local.env` in the `js/apps/examples/uma-vasp/`
directory. This file should contain the following:

```bash
LIGHTSPARK_UMA_RECEIVER_USER=<receiver UMA>
LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN=<pem-encoded x509 certificate chain containing encryption pubkey>
LIGHTSPARK_UMA_ENCRYPTION_PUBKEY=<hex-encoded encryption pubkey>
LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY=<hex-encoded encryption privkey>
LIGHTSPARK_UMA_SIGNING_CERT_CHAIN=<pem-encoded x509 certificate chain containing signing pubkey>
LIGHTSPARK_UMA_SIGNING_PUBKEY=<hex-encoded signing pubkey>
LIGHTSPARK_UMA_SIGNING_PRIVKEY=<hex-encoded signing privkey>

# Optional: A custom VASP domain in case you're hosting this at a fixed hostname.
LIGHTSPARK_UMA_VASP_DOMAIN=<your custom VASP domain. ex: vasp1.example.com>
```

Then, run the image:

```bash
docker run -it --env-file apps/examples/uma-vasp/local.env -p 8080:8080 uma-vasp-js
```

## Running Test Queries

First, we'll start two instances of the server, one on port 8080 and one on port 8081 (in separate terminals):

Terminal 1:

```bash
# First set up config variables. You can also save these in a file or export them to your environment.
# See UmaConfig.ts for the full list of config variables.

# Now start the server on port 8080
$ PORT=8080 yarn start
```

Terminal 2:

```bash
# First set up config variables. You can also save these in a file or export them to your environment.
# See UmaConfig.ts for the full list of config variables.

# Now start the server on port 8081
$ PORT=8081 yarn start
```

Now, you can test the full uma flow like:

```bash
# First, call to vasp1 to lookup Bob at vasp2. This will return currency conversion info, etc. It will also contain a
# callback ID that you'll need for the next call
$ curl -X GET http://localhost:8080/api/umalookup/\$bob@localhost:8081 -u bob:pa55word

# Now, call to vasp1 to get a payment request from vasp2. Replace the last path component here with the callbackUuid
# from the previous call. This will return an invoice and another callback ID that you'll need for the next call.
$ curl -X GET "http://localhost:8080/api/umapayreq/52ca86cd-62ed-4110-9774-4e07b9aa1f0e?amount=100&currencyCode=SAT" -u bob:pa55word

# Now, to send the payment, take the invoice from the previous call and pay it with your spark wallet!
```
