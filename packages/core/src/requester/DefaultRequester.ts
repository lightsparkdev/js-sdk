import type AuthProvider from "../auth/AuthProvider.js";
import { isBare, isNode } from "../utils/environment.js";
import Requester from "./Requester.js";

export class DefaultRequester extends Requester {
  protected async initWsClient(baseUrl: string, authProvider: AuthProvider) {
    if (!this.resolveWsClient) {
      /* If resolveWsClient is null assume already initialized: */
      return this.wsClient;
    }

    if (isBare) {
      /* graphql-ws library is currently not supported in Bare environment, see LIG-7942 */
      return null;
    }

    let websocketImpl;
    if (isNode && typeof WebSocket === "undefined") {
      const wsModule = await import("ws");
      websocketImpl = wsModule.default;
    }
    let websocketProtocol = "wss";
    if (baseUrl.startsWith("http://")) {
      websocketProtocol = "ws";
    }

    const graphqlWsModule = await import("graphql-ws");
    const { createClient } = graphqlWsModule;

    const wsClient = createClient({
      url: `${websocketProtocol}://${this.stripProtocol(this.baseUrl)}/${
        this.schemaEndpoint
      }`,
      connectionParams: () => authProvider.addWsConnectionParams({}),
      webSocketImpl: websocketImpl,
    });

    if (this.resolveWsClient) {
      this.resolveWsClient(wsClient);
      this.resolveWsClient = null;
    }

    return wsClient;
  }
}
export default DefaultRequester;
