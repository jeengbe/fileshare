import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcFileHost } from '@/file-manager/infrastructure/rpc/file-host';
import { RpcHostHandler } from '@/file-manager/infrastructure/rpc/host-handler';
import { StreamPacketClientHandle } from '@/file-manager/infrastructure/stream/client-handle';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandle } from '@/file-manager/infrastructure/stream/host-handle';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';
import { assert } from '@/util/assert';
import { RtcChannelManager } from './channel-manger';
import {
  ClientRtcConnectionStep4,
  HostRtcConnectionStep4,
  RawRtcConnection,
  ReadableWritableChannelManagerTriple,
  RtcConnectionWithMetaChannel,
} from './steps';
import { createRtcChannel } from './util/create-rtc-channel';
import { rtcToReadable, rtcToWritable } from './util/rtc-readable-writable';

export async function rawToWithMetaChannel(
  connection: RawRtcConnection,
): Promise<RtcConnectionWithMetaChannel> {
  const { peerId, connection: rtcConnection } = connection;

  const metaChannel = await createRtcChannel(rtcConnection, 'meta', 0);

  return {
    peerId,
    rtcConnection,
    metaChannel,
  };
}

export function withMetaChannelToReadableWritableChannelManager(
  connection: RtcConnectionWithMetaChannel,
): ReadableWritableChannelManagerTriple {
  const { peerId, rtcConnection, metaChannel } = connection;

  assert(metaChannel.readyState === 'open', 'Meta channel must be open.');
  assert(metaChannel.label === 'meta', 'Meta channel must be labeled "meta".');

  // Channel manager starts creating channels with ID 1.
  assert(metaChannel.id === 0, 'Meta channel must have id 0.');

  return {
    peerId,
    readable: rtcToReadable(metaChannel),
    writable: rtcToWritable(metaChannel),
    channelManager: new RtcChannelManager(rtcConnection),
  };
}

export function step3ToClient4(
  connection: ReadableWritableChannelManagerTriple,
): ClientRtcConnectionStep4 {
  const { peerId, readable, writable, channelManager } = connection;

  const hostHandle = new StreamPacketHostHandle(writable);

  const host = new RpcFileHost(hostHandle);

  const clientHandler = new StreamPacketClientHandler(
    host,
    readable,
    channelManager,
  );

  return {
    peerId,
    host,
    clientHandler,
  };
}

export function step3ToHost4(fileHost: FileHost) {
  return (
    connection: ReadableWritableChannelManagerTriple,
  ): HostRtcConnectionStep4 => {
    const { peerId, readable, writable, channelManager } = connection;

    const clientHandle = new StreamPacketClientHandle(writable, channelManager);

    const host = new RpcHostHandler(fileHost, clientHandle);

    const hostHandler = new StreamPacketHostHandler(host, readable);

    return {
      peerId,
      clientHandle,
      hostHandler,
    };
  };
}
