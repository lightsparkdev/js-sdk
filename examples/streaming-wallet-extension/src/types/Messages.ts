export enum ChannelSource {
  youtube,
  twitch,
  lightspark,
}

export type VideoPlaybackUpdateMessage = {
  videoID: string;
  videoName: string;
  channelID: string;
  channelName: string;
  channelSource: ChannelSource;
  progress: number;
  duration: number;
  isPlaying: boolean;
  prevProgress?: number;
};
