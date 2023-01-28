import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import autoBind from "auto-bind";
import {
  BitcoinNetwork,
  CreateInvoiceMutation,
  CurrencyAmount,
  DecodeInvoiceQuery,
  FeeEstimateQuery,
  InvoiceData,
  SingeNodeDashboardQuery,
} from "./generated/graphql";
import { SingleNodeDashboard } from "./graphql/SingleNodeDashboard";
import { setContext } from "@apollo/client/link/context";
import { b64encode } from "./utils/base64";
import { CreateInvoice } from "graphql/CreateInvoice";
import { DecodeInvoice } from "graphql/DecodeInvoice";
import { FeeEstimate } from "graphql/FeeEstimate";

const LIGHTSPARK_BETA_HEADER = "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo";

class LightsparkWalletClient {
  private tokenId: string;
  private token: string;
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(
    tokenId: string,
    token: string,
    serverUrl: string = "https://api.dev.dev.sparkinfra.net"
  ) {
    this.tokenId = tokenId;
    this.token = token;

    const httpLink = createHttpLink({
      uri: `${serverUrl}/graphql/2023-01-01`,
      headers: {
        "Content-Type": "application/json",
        "X-Lightspark-Beta": LIGHTSPARK_BETA_HEADER,
      },
    });

    const utf8AuthBytes = new TextEncoder().encode(
      `${this.tokenId}:${this.token}`
    );

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: `Basic ${b64encode(utf8AuthBytes)}`,
        },
      };
    });

    this.client = new ApolloClient({
      uri: serverUrl,
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        possibleTypes: {
          // TODO autogenerate this, see:
          // https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically
          Node: ["GraphNode", "LightsparkNode"],
          Transaction: [
            "RoutingTransaction",
            "IncomingPayment",
            "OutgoingPayment",
            "OnChainTransaction",
          ],
          OnChainTransaction: [
            "Deposit",
            "Withdrawal",
            "ChannelOpeningTransaction",
            "ChannelClosingTransaction",
          ],
        },
      }),
    });

    autoBind(this);
  }

  public async getWalletDashboard(
    nodeId: string
  ): Promise<SingeNodeDashboardQuery> {
    const response = await this.client.query({
      query: SingleNodeDashboard,
      variables: {
        nodeId,
        network: BitcoinNetwork.Regtest,
        numTransactions: 20,
      },
    });
    return response.data;
  }

  public async createInvoice(
    nodeId: string,
    amount: number,
    memo: string
  ): Promise<string | undefined> {
    const response = await this.client.mutate<CreateInvoiceMutation>({
      mutation: CreateInvoice,
      variables: {
        nodeId,
        amount,
        memo,
      },
    });
    return response.data?.create_invoice?.invoice.data?.encoded_payment_request;
  }

  public async decodeInvoice(encodedInvoice: string): Promise<InvoiceData> {
    const response = await this.client.query<DecodeInvoiceQuery>({
      query: DecodeInvoice,
      variables: {
        encodedInvoice,
      },
    });
    return response.data.decoded_payment_request;
  }

  public async getFeeEstimate(
    bitcoinNetwork: BitcoinNetwork = BitcoinNetwork.Mainnet
  ): Promise<{ fee_min: CurrencyAmount; fee_fast: CurrencyAmount }> {
    const response = await this.client.query<FeeEstimateQuery>({
      query: FeeEstimate,
      variables: {
        network: bitcoinNetwork,
      },
    });
    return response.data.fee_estimate;
  }
}

export { LightsparkWalletClient };
