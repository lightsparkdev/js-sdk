import PlaybackRange from "./PlaybackRange";

export interface PaymentStrategy {
  onPlayedRange(
    previousRanges: PlaybackRange[],
    newRanges: PlaybackRange[]
  ): number;
}

export class LinearPaymentStrategy implements PaymentStrategy {
  private readonly paymentPerChunkMsats: number;
  private readonly chunkSizeSec: number;

  constructor(paymentPerChunkMsats: number, chunkSizeSec: number) {
    this.paymentPerChunkMsats = paymentPerChunkMsats;
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
  ): number {
    const newChunks = this.numberOfChunksInRanges(newRanges);
    const previousChunks = this.numberOfChunksInRanges(previousRanges);
    const chunkDiff = newChunks - previousChunks;
    return this.paymentPerChunkMsats * chunkDiff;
  }
}
