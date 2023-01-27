import PlaybackRangesTracker from "./VideoPlaybackRanges";

class VideoProgressCache {
    private videoProgressCache: {[videoID: string]: PlaybackRangesTracker};
    private needsWrite: boolean = false;

    constructor() {
        this.videoProgressCache = {};
        this.readProgressFromStorage();
    }

    addProgress(videoID: string, start: number, end: number) {
        if (!this.videoProgressCache[videoID]) {
            this.videoProgressCache[videoID] = new PlaybackRangesTracker();
        }
        this.videoProgressCache[videoID].addPlayedRange(start, end);
        this.needsWrite = true;
    }

    readProgressFromStorage() {
        chrome.storage.local.get(null, (result) => {
            Object.keys(result).forEach((key) => {
                if (key.startsWith("video_")) {
                    const videoID = key.replace("video_", "");
                    const videoRanges = result[key];
                    this.videoProgressCache[videoID] = videoRanges;
                }
            });
        });
    }

    writeProgressToStorage() {
        const newEntrys: any = {};
        Object.keys(this.videoProgressCache).forEach((videoID) => {
            const videoRanges = this.videoProgressCache[videoID];
            newEntrys[`video_${videoID}`] = videoRanges;
        });
        chrome.storage.local.set(newEntrys);
    }

    needsWriteToStorage() {
        return this.needsWrite;
    }
}

export default VideoProgressCache;
