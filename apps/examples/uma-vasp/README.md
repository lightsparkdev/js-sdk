# UMA Demo Server

An example UMA VASP server implementation using Typescript.

## Running the server

Configuration parameters (API keys, etc.) and information on how to set them can be found in `src/UmaConfig.ts`.
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
LIGHTSPARK_API_TOKEN_CLIENT_ID=<api token id> \
LIGHTSPARK_API_TOKEN_CLIENT_SECRET=<api token secret> \
LIGHTSPARK_UMA_NODE_ID=<your node ID> \
LIGHTSPARK_UMA_RECEIVER_USER=\$bob \
LIGHTSPARK_UMA_ENCRYPTION_PUBKEY=<encryption public key hex> \
LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY=<encryption private key hex> \
LIGHTSPARK_UMA_SIGNING_PUBKEY=<signing public key hex> \
LIGHTSPARK_UMA_SIGNING_PRIVKEY=<signing private key hex> \
yarn start
```

## Running Test Queries

First, we'll start two instances of the server, one on port 8080 and one on port 8081 (in separate terminals):

Terminal 1:

```bash
# First set up config variables. You can also save these in a file or export them to your environment.
$ export LIGHTSPARK_API_TOKEN_CLIENT_ID=<client_id>
$ export LIGHTSPARK_API_TOKEN_CLIENT_SECRET=<client_secret>
# etc... See UmaConfig.ts for the full list of config variables.

# Now start the server on port 8080
$ PORT=8080 yarn start
```

Terminal 2:

```bash
# First set up the variables as above. If you want to be able to actually send payments, use a different account.
$ export LIGHTSPARK_API_TOKEN_CLIENT_ID=<client_id_2>
$ export LIGHTSPARK_API_TOKEN_CLIENT_SECRET=<client_secret_2>
# etc... See UmaConfig.ts for the full list of config variables.

# Now start the server on port 8081
$ PORT=8081 yarn start
```

Now, you can test the full uma flow like:

```bash
# First, call to vasp1 to lookup Bob at vasp2. This will return currency conversion info, etc. It will also contain a 
# callback ID that you'll need for the next call
$ curl -X GET http://localhost:8080/api/umalookup/\$bob@localhost:8081

# Now, call to vasp1 to get a payment request from vasp2. Replace the last path component here with the callbackUuid
# from the previous call. This will return an invoice and another callback ID that you'll need for the next call.
$ curl -X GET "http://localhost:8080/api/umapayreq/52ca86cd-62ed-4110-9774-4e07b9aa1f0e?amount=100&currencyCode=USD"

# Now, call to vasp1 to send the payment. Replace the last path component here with the callbackUuid from the payreq
# call. This will return a payment ID that you can use to check the status of the payment.
curl -X POST http://localhost:8080/api/sendpayment/e26cbee9-f09d-4ada-a731-965cbd043d50
```
