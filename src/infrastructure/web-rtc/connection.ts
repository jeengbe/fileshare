import assert from 'assert';
import { ChannelManager } from '../stream/channel-manager';
import { WebRtcReadableWritable } from '../util/web-rtc-readable-writable';
import { WebRtcChannelManager } from './channel-manger';

export class WebRtcConnection {
  public readonly writable: WritableStream<ArrayBuffer>;
  public readonly readable: ReadableStream<ArrayBuffer>;
  public readonly channelManager: ChannelManager;

  constructor(connection: RTCPeerConnection, metaChannel: RTCDataChannel) {
    assert(metaChannel.readyState === 'open', 'meta channel must be open');
    assert(metaChannel.label === 'meta', 'meta channel must be labeled "meta"');

    ({ writable: this.writable, readable: this.readable } =
      new WebRtcReadableWritable(metaChannel));

    this.channelManager = new WebRtcChannelManager(connection);
  }
}
