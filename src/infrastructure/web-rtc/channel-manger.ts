import { ChannelManager } from '../stream/channel-manager';
import { WebRtcReadableWritable } from '../util/web-rtc-readable-writable';

export class WebRtcChannelManager implements ChannelManager {
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

    return new WebRtcReadableWritable(channel).writable;
  }

  async getReadable(channelId: number): Promise<ReadableStream<ArrayBuffer>> {
    const channel = this.connection.createDataChannel(channelId.toString(), {
      negotiated: true,
      id: channelId,
    });

    await new Promise((resolve) => (channel.onopen = resolve));
    channel.onopen = null;

    return new WebRtcReadableWritable(channel).readable;
  }
}
