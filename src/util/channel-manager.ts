export interface ChannelManager {
  getFreeChannelId(): number;
  getWritable(channelId: number): Promise<WritableStream<ArrayBufferLike>>;
  getReadable(channelId: number): Promise<ReadableStream<ArrayBufferLike>>;
}
