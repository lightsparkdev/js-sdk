class PlaybackRange {
    start: number;
    end: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    mergeWith(other: PlaybackRange) {
        if (other.start < this.start) {
            this.start = other.start;
        }
        if (other.end > this.end) {
            this.end = other.end;
        }
    }

    isOverlapping(other: PlaybackRange) {
        return this.start <= other.end && this.end >= other.start;
    }

    duration() {
        return this.end - this.start;
    }
}

export default PlaybackRange;