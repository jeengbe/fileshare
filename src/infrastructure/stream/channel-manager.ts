export interface ChannelManager {
  getNextChannelId(): number;
  getWritable(channelId: number): Promise<WritableStream<ArrayBuffer>>;
  getReadable(channelId: number): Promise<ReadableStream<ArrayBuffer>>;
}
