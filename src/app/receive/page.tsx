import { RpcFileHost } from '@/application/rpc/file-host';
import { StreamPacketClientHandler } from '@/infrastructure/stream/packet/client-handler';
import { StreamPacketHostHandle } from '@/infrastructure/stream/packet/host-handle';
import { WebRtcConnection } from '@/infrastructure/web-rtc/connection';

export default function Page() {
  const onHostConnect = async (connection: RTCPeerConnection) => {
    const metaChannel = connection.createDataChannel('meta', {
      negotiated: true,
      id: 0,
    });

    await new Promise((resolve) => (metaChannel.onopen = resolve));
    metaChannel.onopen = null;

    const { writable, readable, channelManager } = new WebRtcConnection(
      connection,
      metaChannel,
    );

    const hostHandle = new StreamPacketHostHandle(writable);

    const fileHost = new RpcFileHost(hostHandle);

    const packetHandler = new StreamPacketClientHandler(
      fileHost,
      readable,
      channelManager,
    );

    await packetHandler.subscribe();
  };

  return <></>;
}
