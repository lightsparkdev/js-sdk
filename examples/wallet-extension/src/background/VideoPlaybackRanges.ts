import PlaybackRange from "./PlaybackRange";

class VideoPlaybackRanges {
  private playedRanges: Array<PlaybackRange> = [];

  constructor() {}

  addPlayedRange(start: number, end: number) {
    if (start > end) return;
    const newRange = new PlaybackRange(start, end);
    if (!this.mergeOverlappingRangeIfApplicable(newRange)) {
      this.playedRanges.push(newRange);
    }
  }

  mergeOverlappingRangeIfApplicable(playbackRange: PlaybackRange): boolean {
    for (let i = 0; i < this.playedRanges.length; i++) {
      let range = this.playedRanges[i];
      if (range.isOverlapping(playbackRange)) {
        range.mergeWith(playbackRange);
        return true;
      }
    }
    return false;
  }

  getPlayedRanges() {
    return this.playedRanges;
  }

  getPlayedDuration() {
    let duration = 0;
    this.playedRanges.forEach((range) => {
      duration += range.end - range.start;
    });
    return duration;
  }
}

export default VideoPlaybackRanges;
