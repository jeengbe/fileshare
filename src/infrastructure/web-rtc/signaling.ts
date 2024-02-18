import { LocalFileHost } from '@/application/local/file-host';
import { FileManager } from '@/application/local/file-manager';
import { FileHost } from '@/domain/service/file-host';

export class HostManager {
  async connect(): Promise<string> {
    return 'YOUD GUID';
  }

  onNewHost(callback: (hostId: string, fileHost: FileHost) => void) {
    console.log('Listening for new connections...');

    const fileManager = new FileManager();
    const fakeHost = new LocalFileHost('ASDCO', fileManager);
    let i = 0;
    fileManager.addFile({
      name: 'test.txt',
      size: 1000000000,
      stream: () =>
        new ReadableStream({
          pull(controller) {
            if (i++ < 1000000) {
              controller.enqueue(new Uint8Array(1000));
            } else {
              controller.close();
            }
          },
        }),
    } as File);

    callback('LE UUID', fakeHost);
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
