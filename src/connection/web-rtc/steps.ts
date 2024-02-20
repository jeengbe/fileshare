import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcClientHandle } from '@/file-manager/infrastructure/rpc/client-handle';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';
import { ChannelManager } from '../channel-manager';

export interface WithPeerId {
  peerId: string;
}

export interface RawRtcConnection extends WithPeerId {
  connection: RTCPeerConnection;
}

export interface RtcConnectionWithMetaChannel extends WithPeerId {
  rtcConnection: RTCPeerConnection;
  metaChannel: RTCDataChannel;
}

export interface ReadableWritableChannelManagerTriple
  extends ReadableWritablePair<ArrayBuffer, ArrayBuffer>,
    WithPeerId {
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
