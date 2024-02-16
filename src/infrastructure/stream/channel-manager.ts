export interface ChannelManager {
  negotiateChannel(): Promise<string>;

  streamToChannel(channelId: string, stream: ReadableStream<Uint8Array>): void;
  streamFromChannel(channelId: string): ReadableStream<Uint8Array>;
}
