export interface ChannelManager {
  getNextChannelId(): number;
  getWritable(channelId: number): WritableStream<ArrayBuffer>;
  getReadable(channelId: number): ReadableStream<ArrayBuffer>;
}
