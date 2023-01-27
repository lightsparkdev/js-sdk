export type DOMMessage = {
  type: 'GET_DOM'
}

export enum ChannelSource {
    youtube, twitch
}

export type DOMMessageResponse = {
  videoID: string;
  videoName: string;
  channelID: string;
  channelName: string;
  channelSource: ChannelSource;
  progress: number;
  duration: number;
  prevProgress?: number
}