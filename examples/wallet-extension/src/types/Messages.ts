export type StartTrackingVideoMessage = {
  type: 'START_LISTENING'
}

export enum ChannelSource {
    youtube, twitch
}

export type VideoPlaybackUpdateMessage = {
  videoID: string;
  videoName: string;
  channelID: string;
  channelName: string;
  channelSource: ChannelSource;
  progress: number;
  duration: number;
  prevProgress?: number
}