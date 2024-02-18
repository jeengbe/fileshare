import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcClientHandle } from '@/file-manager/infrastructure/rpc/client-handle';
import { ChannelManager } from '@/file-manager/infrastructure/stream/channel-manager';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';

export interface RtcConnectionStep1 {
  rtcConnection: RTCPeerConnection;
}

export interface RtcConnectionStep2 {
  rtcConnection: RTCPeerConnection;
  metaChannel: RTCDataChannel;
}

export interface RtcConnectionStep3 {
  readable: ReadableStream<ArrayBuffer>;
  writable: WritableStream<ArrayBuffer>;
  channelManager: ChannelManager;
}

export interface ClientRtcConnectionStep4 {
  host: FileHost;
  clientHandler: StreamPacketClientHandler;
}

export interface HostRtcConnectionStep4 {
  clientHandle: RpcClientHandle;
  hostHandler: StreamPacketHostHandler;
}
