import { assert } from '@/util/assert';
import { ChannelManager } from '@/util/channel-manager';
import { RtcChannelManager } from './channel-manger';
import { createRtcChannel } from './util/create-rtc-channel';

export async function createMetaChannel(
  rtcConnection: RTCPeerConnection,
): Promise<RTCDataChannel> {
  assert(rtcConnection.connectionState === 'new', 'Connection must be new.');

  const metaChannel = await createRtcChannel(rtcConnection, 'meta', 0);

  return metaChannel;
}

export function createChannelManager(
  rtcConnection: RTCPeerConnection,
  metaChannel: RTCDataChannel,
): ChannelManager {
  assert(metaChannel.readyState === 'open', 'Meta channel must be open.');
  assert(metaChannel.label === 'meta', 'Meta channel must be labeled "meta".');

  // Channel manager starts creating channels with ID 1.
  assert(metaChannel.id === 0, 'Meta channel must have id 0.');

  return new RtcChannelManager(rtcConnection);
}
