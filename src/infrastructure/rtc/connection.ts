import assert from 'assert';
import { ChannelManager } from '../stream/channel-manager';
import { RtcChannelManager } from './channel-manger';
import { RtcReadableWritable } from './util/rtc-readable-writable';

export class RtcConnection {
  public readonly writable: WritableStream<ArrayBuffer>;
  public readonly readable: ReadableStream<ArrayBuffer>;
  public readonly channelManager: ChannelManager;

  constructor(connection: RTCPeerConnection, metaChannel: RTCDataChannel) {
    assert(metaChannel.readyState === 'open', 'Meta channel must be open.');
    assert(
      metaChannel.label === 'meta',
      'Meta channel must be labeled "meta".',
    );

    // Channel manager starts creating channels with ID 1.
    assert(metaChannel.id === 0, 'Meta channel must have id 0.');

    ({ writable: this.writable, readable: this.readable } =
      new RtcReadableWritable(metaChannel));

    this.channelManager = new RtcChannelManager(connection);
  }
}