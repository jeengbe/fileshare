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
  RtcConnectionStep1,
  RtcConnectionStep2,
  RtcConnectionStep3,
} from './steps';
import { rtcToReadable, rtcToWritable } from './util/rtc-readable-writable';

export async function step1To2(
  connection: RtcConnectionStep1,
): Promise<RtcConnectionStep2> {
  const { rtcConnection } = connection;

  const metaChannel = rtcConnection.createDataChannel('meta', {
    negotiated: true,
    id: 0,
  });

  await new Promise((resolve) => (metaChannel.onopen = resolve));
  metaChannel.onopen = null;

  return {
    rtcConnection,
    metaChannel,
  };
}

export function step2To3(connection: RtcConnectionStep2): RtcConnectionStep3 {
  const { rtcConnection, metaChannel } = connection;

  assert(metaChannel.readyState === 'open', 'Meta channel must be open.');
  assert(metaChannel.label === 'meta', 'Meta channel must be labeled "meta".');

  // Channel manager starts creating channels with ID 1.
  assert(metaChannel.id === 0, 'Meta channel must have id 0.');

  return {
    readable: rtcToReadable(metaChannel),
    writable: rtcToWritable(metaChannel),
    channelManager: new RtcChannelManager(rtcConnection),
  };
}

export function step3ToClient4(
  connection: RtcConnectionStep3,
): ClientRtcConnectionStep4 {
  const { readable, writable, channelManager } = connection;

  const hostHandle = new StreamPacketHostHandle(writable);

  const host = new RpcFileHost(hostHandle);

  const clientHandler = new StreamPacketClientHandler(
    host,
    readable,
    channelManager,
  );

  return {
    host,
    clientHandler,
  };
}

export function step3ToHost4(
  fileHost: FileHost,
  connection: RtcConnectionStep3,
): HostRtcConnectionStep4 {
  const { readable, writable, channelManager } = connection;

  const clientHandle = new StreamPacketClientHandle(writable, channelManager);

  const host = new RpcHostHandler(fileHost, clientHandle);

  const hostHandler = new StreamPacketHostHandler(host, readable);

  return {
    clientHandle,
    hostHandler,
  };
}
