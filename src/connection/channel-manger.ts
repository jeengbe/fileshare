import { ChannelManager } from '@/file-manager/infrastructure/stream/channel-manager';
import { rtcToReadable, rtcToWritable } from './util/rtc-readable-writable';

export class RtcChannelManager implements ChannelManager {
  private lastChannelId = 1;

  constructor(private readonly connection: RTCPeerConnection) {}

  getFreeChannelId(): number {
    return this.lastChannelId++;
  }

  async getWritable(channelId: number): Promise<WritableStream<ArrayBuffer>> {
    const channel = this.connection.createDataChannel(channelId.toString(), {
      negotiated: true,
      id: channelId,
    });

    await new Promise((resolve) => (channel.onopen = resolve));
    channel.onopen = null;

    return rtcToWritable(channel);
  }

  async getReadable(channelId: number): Promise<ReadableStream<ArrayBuffer>> {
    const channel = this.connection.createDataChannel(channelId.toString(), {
      negotiated: true,
      id: channelId,
    });

    await new Promise((resolve) => (channel.onopen = resolve));
    channel.onopen = null;

    return rtcToReadable(channel);
  }
}
