import {
  createChannelManager,
  createMetaChannel,
} from '@/connection/web-rtc/map';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcHostHandler } from '@/file-manager/infrastructure/rpc/host-handler';
import { StreamPacketClientHandle } from '@/file-manager/infrastructure/stream/client-handle';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';
import { useLater } from '@/util/use-later';

export const SendClient = ({
  peerId,
  rtcConnection,
  fileHost,
}: {
  peerId: string;
  rtcConnection: RTCPeerConnection;
  fileHost: FileHost;
}) => {
  const connected = useLater(async () => {
    const metaChannel = await createMetaChannel(rtcConnection);
    const channelManager = createChannelManager(rtcConnection, metaChannel);

    const rpcHostHandler = new RpcHostHandler(
      fileHost,
      new StreamPacketClientHandle(
        {
          write: metaChannel.send.bind(metaChannel),
        },
        channelManager,
      ),
    );

    const hostHandler = new StreamPacketHostHandler(rpcHostHandler);

    metaChannel.onmessage = ({ data }) =>
      hostHandler.onMessage(data as ArrayBufferLike);

    return true;
  });

  return connected ? <Client peerId={peerId} /> : <p>Connecting...</p>;
};

const Client = ({ peerId }: { peerId: string }) => {
  return <p>Client: {peerId}</p>;
};
