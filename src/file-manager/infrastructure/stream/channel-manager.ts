export interface ChannelManager {
  getFreeChannelId(): number;
  getWritable(channelId: number): Promise<WritableStream<ArrayBuffer>>;
  getReadable(channelId: number): Promise<ReadableStream<ArrayBuffer>>;
}
