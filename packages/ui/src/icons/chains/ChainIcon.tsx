import type { ReactElement } from "react";
import { Arbitrum } from "./Arbitrum.js";
import { Avalanche } from "./Avalanche.js";
import { Base } from "./Base.js";
import { Ethereum } from "./Ethereum.js";
import { Optimism } from "./Optimism.js";
import { Polygon } from "./Polygon.js";
import { Solana } from "./Solana.js";
import { Tron } from "./Tron.js";

export type Chain =
  | "solana"
  | "ethereum"
  | "base"
  | "polygon"
  | "avalanche"
  | "arbitrum"
  | "optimism"
  | "tron";

const CHAIN_COMPONENTS: Record<
  Chain,
  (props: { size?: number }) => ReactElement
> = {
  solana: Solana,
  ethereum: Ethereum,
  base: Base,
  polygon: Polygon,
  avalanche: Avalanche,
  arbitrum: Arbitrum,
  optimism: Optimism,
  tron: Tron,
};

export function ChainIcon({
  chain,
  size = 24,
}: {
  chain: Chain;
  size?: number;
}) {
  const Component = CHAIN_COMPONENTS[chain];
  return <Component size={size} />;
}
