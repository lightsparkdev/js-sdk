import { Base } from "./Base.js";
import { Ethereum } from "./Ethereum.js";
import { Polygon } from "./Polygon.js";
import { Solana } from "./Solana.js";

export type Chain = "solana" | "ethereum" | "base" | "polygon";

const CHAIN_COMPONENTS: Record<
  Chain,
  (props: { size?: number }) => JSX.Element
> = {
  solana: Solana,
  ethereum: Ethereum,
  base: Base,
  polygon: Polygon,
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
