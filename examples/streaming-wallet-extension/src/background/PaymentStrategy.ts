import { CurrencyAmountInput } from "@lightsparkdev/js-sdk/objects";
import PlaybackRange from "./PlaybackRange";

export interface PaymentStrategy {
  onPlayedRange(
    previousRanges: PlaybackRange[],
    newRanges: PlaybackRange[]
  ): CurrencyAmountInput;
}

export class LinearPaymentStrategy implements PaymentStrategy {
  private readonly paymentPerChunk: CurrencyAmountInput;
  private readonly chunkSizeSec: number;

  constructor(paymentPerChunk: CurrencyAmountInput, chunkSizeSec: number) {
    this.paymentPerChunk = paymentPerChunk;
    this.chunkSizeSec = chunkSizeSec;
  }

  private numberOfChunksInRanges(ranges: PlaybackRange[]): number {
    const totalDuration = ranges.reduce(
      (acc, range) => acc + range.duration(),
      0
    );
    return Math.ceil(totalDuration / this.chunkSizeSec);
  }

  onPlayedRange(
    previousRanges: PlaybackRange[],
    newRanges: PlaybackRange[]
  ): CurrencyAmountInput {
    const newChunks = this.numberOfChunksInRanges(newRanges);
    const previousChunks = this.numberOfChunksInRanges(previousRanges);
    const chunkDiff = newChunks - previousChunks;
    console.log(`From ${previousChunks} to ${newChunks}`);
    return {
      unit: this.paymentPerChunk.unit,
      value: this.paymentPerChunk.value * chunkDiff,
    };
  }
}
