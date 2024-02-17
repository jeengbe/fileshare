import { LocalFileHost } from './application/local/file-host';
import { FileManager } from './application/local/file-manager';
import { RpcFileHost } from './application/rpc/file-host';
import { RpcHostHandlerImpl } from './application/rpc/host-handler';
import { ChannelManager } from './infrastructure/stream/channel-manager';
import {
  FileSharingDecoder,
  FileSharingEncoder,
} from './infrastructure/stream/codec';
import { StreamPacketClientHandle } from './infrastructure/stream/packet/client-handle';
import { StreamPacketClientHandler } from './infrastructure/stream/packet/client-handler';
import { StreamPacketHostHandle } from './infrastructure/stream/packet/host-handle';
import { StreamPacketHostHandler } from './infrastructure/stream/packet/host-handler';

const fileManager = new FileManager();
const localFileHost = new LocalFileHost(fileManager);

fileManager.addFile(new File(['hello'], 'hello.txt'));

/*
 * ESTABLISH CONNECTION
 */
const channelManager = null as unknown as ChannelManager;
const { readable: localReadable, writable: remoteWritable } =
  new TransformStream<ArrayBuffer, ArrayBuffer>({
    transform(chunk, controller) {
      console.log('Local <- Remote', chunk);
      controller.enqueue(chunk);
    },
  });
const { writable: localWritable, readable: remoteReadable } =
  new TransformStream<ArrayBuffer, ArrayBuffer>({
    transform(chunk, controller) {
      console.log('Local -> Remote', chunk);
      controller.enqueue(chunk);
    },
  });

/*
 * LOCAL
 */
const clientHandle = new StreamPacketClientHandle(
  localWritable,
  new FileSharingEncoder(),
  channelManager,
);

const hostHandler = new RpcHostHandlerImpl(localFileHost, clientHandle);

const hostPacketHandler = new StreamPacketHostHandler(
  localReadable,
  hostHandler,
  new FileSharingDecoder(),
);

void hostPacketHandler.subscribe();

/*
 * REMOTE
 */
const hostHandle = new StreamPacketHostHandle(
  remoteWritable,
  new FileSharingEncoder(),
);

const networkFileHost = new RpcFileHost(hostHandle);

const clientPacketHandler = new StreamPacketClientHandler(
  remoteReadable,
  networkFileHost,
  new FileSharingDecoder(),
  channelManager,
);

void clientPacketHandler.subscribe();

void networkFileHost.listFilesMetadata().then(console.log);
