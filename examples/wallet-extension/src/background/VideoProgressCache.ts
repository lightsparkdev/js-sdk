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
        console.log(`Added progress for ${videoID}: ${start} - ${end}`);
        console.log(`Current ranges: ${JSON.stringify(this.videoProgressCache[videoID].getPlayedRanges())}`);
        this.needsWrite = true;
    }

    readProgressFromStorage() {
        chrome.storage.local.get(null, (result) => {
            Object.keys(result).forEach((key) => {
                if (key.startsWith("video_")) {
                    const videoID = key.replace("video_", "");
                    const videoRanges = result[key]["playedRanges"];
                    this.videoProgressCache[videoID] = new PlaybackRangesTracker();
                    videoRanges.forEach((range: any) => {
                        this.videoProgressCache[videoID].addPlayedRange(range.start, range.end);
                    });
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
