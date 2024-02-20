import { ChannelManager } from '../channel-manager';
import { createRtcChannel } from './util/create-rtc-channel';
import { rtcToReadable, rtcToWritable } from './util/rtc-readable-writable';

export class RtcChannelManager implements ChannelManager {
  private lastChannelId = 1;

  constructor(private readonly connection: RTCPeerConnection) {}

  getFreeChannelId(): number {
    return this.lastChannelId++;
  }

  async getWritable(channelId: number): Promise<WritableStream<ArrayBuffer>> {
    const channel = await createRtcChannel(
      this.connection,
      channelId.toString(),
      channelId,
    );

    return rtcToWritable(channel);
  }

  async getReadable(channelId: number): Promise<ReadableStream<ArrayBuffer>> {
    const channel = await createRtcChannel(
      this.connection,
      channelId.toString(),
      channelId,
    );

    return rtcToReadable(channel);
  }
}
