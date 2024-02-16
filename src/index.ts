import { LocalFileHost } from './application/local/file-host';
import { FileManager } from './application/local/file-manager';
import { NetworkFileHost } from './application/network/file-host';
import { NetworkHostHandler } from './application/network/host-handler';
import { ChannelManager } from './infrastructure/web-rtc/channel-manager';
import { WebRtcClientHandle } from './infrastructure/web-rtc/client-handle';
import { WebRtcClientHandler } from './infrastructure/web-rtc/client-handler';
import {
  FileSharingDecoder,
  FileSharingEncoder,
} from './infrastructure/web-rtc/codec';
import { WebRtcHostHandle } from './infrastructure/web-rtc/host-handle';
import { WebRtcHostHandler } from './infrastructure/web-rtc/host-handler';

const fileManager = new FileManager();
const localFileHost = new LocalFileHost(fileManager);

fileManager.addFile(new File(['hello'], 'hello.txt'));

/*
 * ESTABLISH CONNECTION
 */
const channelManager = null as unknown as ChannelManager;
const { readable: localReadable, writable: remoteWritable } =
  new TransformStream<ArrayBuffer, ArrayBuffer>();
const { writable: localWritable, readable: remoteReadable } =
  new TransformStream<ArrayBuffer, ArrayBuffer>();

/*
 * LOCAL
 */
const clientHandle = new WebRtcClientHandle(
  localWritable,
  new FileSharingEncoder(),
  channelManager,
);

const hostHandler = new NetworkHostHandler(localFileHost, clientHandle);

const hostPacketHandler = new WebRtcHostHandler(
  localReadable,
  hostHandler,
  new FileSharingDecoder(),
);

void hostPacketHandler.subscribe();

/*
 * REMOTE
 */
const hostHandle = new WebRtcHostHandle(
  remoteWritable,
  new FileSharingEncoder(),
);

const networkFileHost = new NetworkFileHost(hostHandle);

const clientPacketHandler = new WebRtcClientHandler(
  remoteReadable,
  networkFileHost,
  new FileSharingDecoder(),
  channelManager,
);

void clientPacketHandler.subscribe();

void networkFileHost.listFilesMetadata().then(console.log);
