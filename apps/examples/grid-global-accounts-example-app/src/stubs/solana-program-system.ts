// Privy's bundle imports this optional peer for Solana funding flows this app
// never runs, so the build resolves it to this stub instead of installing it.
export function getTransferSolInstruction(): never {
  throw new Error("Solana flows are not part of this example app.");
}
