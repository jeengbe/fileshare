import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcClientHandle } from '@/file-manager/infrastructure/rpc/client-handle';
import { ChannelManager } from '@/file-manager/infrastructure/stream/channel-manager';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';

export interface WithPeerId {
  peerId: string;
}

export interface RtcConnectionStep1 extends WithPeerId {
  connection: RTCPeerConnection;
}

export interface RtcConnectionStep2 extends WithPeerId {
  rtcConnection: RTCPeerConnection;
  metaChannel: RTCDataChannel;
}

export interface RtcConnectionStep3 extends WithPeerId {
  readable: ReadableStream<ArrayBuffer>;
  writable: WritableStream<ArrayBuffer>;
  channelManager: ChannelManager;
}

export interface ClientRtcConnectionStep4 extends WithPeerId {
  host: FileHost;
  clientHandler: StreamPacketClientHandler;
}

export interface HostRtcConnectionStep4 extends WithPeerId {
  clientHandle: RpcClientHandle;
  hostHandler: StreamPacketHostHandler;
}
