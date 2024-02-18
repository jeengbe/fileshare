import { LocalFileHost } from '@/file-manager/application/local/file-host';
import { FileManager } from '@/file-manager/application/local/file-manager';
import { RpcHostHandlerImpl } from '@/file-manager/application/rpc/host-handler';
import { StreamPacketClientHandle } from '@/file-manager/infrastructure/rtc/packet/client-handle';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/packet/host-handler';
import { RtcConnection } from '@/file-manager/infrastructure/web-rtc/connection';
import { useMemo, useRef } from 'react';

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null);

  const fileManager = useMemo(() => new FileManager(), []);
  const localFileHost = useMemo(
    () => new LocalFileHost(fileManager),
    [fileManager],
  );

  const onClientRequest = async (
    clientDescription: RTCSessionDescriptionInit,
    sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>,
    sendCandidate: (candidate: RTCIceCandidate) => Promise<void>,
  ) => {
    const connection = new RTCPeerConnection();
    await connection.setRemoteDescription(clientDescription);

    const hostDescription = await connection.createAnswer();
    await connection.setLocalDescription(hostDescription);

    await sendAnswer(hostDescription);

    connection.onicecandidate = async ({ candidate }) => {
      if (!candidate) {
        console.log('no candidate');
        return;
      }

      await sendCandidate(candidate);
    };
  };

  const onClientConnect = async (connection: RTCPeerConnection) => {
    const metaChannel = connection.createDataChannel('meta', {
      negotiated: true,
      id: 0,
    });

    await new Promise((resolve) => (metaChannel.onopen = resolve));
    metaChannel.onopen = null;

    const { writable, readable, channelManager } = new RtcConnection(
      connection,
      metaChannel,
    );

    const clientHandle = new StreamPacketClientHandle(writable, channelManager);

    const hostHandler = new RpcHostHandlerImpl(localFileHost, clientHandle);

    const packetHandler = new StreamPacketHostHandler(hostHandler, readable);

    await packetHandler.subscribe();
  };

  return (
    <>
      <form
        onSubmit={() => {
          const file = fileRef.current?.files?.[0];

          if (file) {
            fileManager.addFile(file);
            fileRef.current.value = '';
          }
        }}
      >
        <input type='file' ref={fileRef} />
        <button type='submit'>Send</button>
      </form>
    </>
  );
}
