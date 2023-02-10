class PlaybackRange {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  mergeWith(other: PlaybackRange) {
    let start = this.start;
    let end = this.end;
    if (other.start < this.start) {
      start = other.start;
    }
    if (other.end > this.end) {
      end = other.end;
    }
    return new PlaybackRange(start, end);
  }

  isOverlapping(other: PlaybackRange) {
    return this.start <= other.end && this.end >= other.start;
  }

  duration() {
    return this.end - this.start;
  }
}

export default PlaybackRange;
