import { LocalFileHost } from '@/application/local/file-host';
import { FileManager } from '@/application/local/file-manager';
import { FileHost } from '@/domain/service/file-host';

export class HostManager {
  async connect(): Promise<string> {
    console.log('Connecting to signaling server...');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Connected to signaling server');

    return '550e8400-e29b-11d4-a716-446655440000';
  }

  onNewHost(callback: (hostId: string, fileHost: FileHost) => void) {
    console.log('Listening for new connections...');

    void new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
      const fileManager = new FileManager();
      const fakeHost = new LocalFileHost(fileManager);

      callback('asd', fakeHost);

      void new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
        fileManager.addFile(
          new File([new Uint32Array([174355297])], 'test.txt'),
        );
      });
    });
  }
}

// const onHostConnect = async (
//   hostId: string,
//   connection: RTCPeerConnection,
// ) => {
//   setHosts((hosts) =>
//     new Map(hosts).set(hostId, {
//       id: hostId,
//       state: HostState.Connecting,
//     }),
//   );

//   const metaChannel = connection.createDataChannel('meta', {
//     negotiated: true,
//     id: 0,
//   });

//   await new Promise((resolve) => (metaChannel.onopen = resolve));
//   metaChannel.onopen = null;

//   const { writable, readable, channelManager } = new WebRtcConnection(
//     connection,
//     metaChannel,
//   );

//   const hostHandle = new StreamPacketHostHandle(writable);

//   const fileHost = new RpcFileHost(hostHandle);

//   const packetHandler = new StreamPacketClientHandler(
//     fileHost,
//     readable,
//     channelManager,
//   );

//   await packetHandler.subscribe();

//   await onNewHost(hostId, fileHost);
// };
