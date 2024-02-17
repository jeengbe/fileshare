import { ChannelManager } from '../stream/channel-manager';
import { WebRtcReadableWritable } from '../util/web-rtc-readable-writable';

export class WebRtcChannelManager implements ChannelManager {
  private lastChannelId = 1;

  constructor(private readonly connection: RTCPeerConnection) {}

  getNextChannelId(): number {
    return this.lastChannelId++;
  }

  getWritable(channelId: number): WritableStream<ArrayBuffer> {
    const channel = this.connection.createDataChannel(channelId.toString(), {
      negotiated: true,
      id: channelId,
    });

    return new WebRtcReadableWritable(channel).writable;
  }

  getReadable(channelId: number): ReadableStream<ArrayBuffer> {
    const channel = this.connection.createDataChannel(channelId.toString(), {
      negotiated: true,
      id: channelId,
    });

    return new WebRtcReadableWritable(channel).readable;
  }
}
