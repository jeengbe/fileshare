import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcClientHandle } from '@/file-manager/infrastructure/rpc/client-handle';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';
import { WithPeerId } from '../web-rtc/steps';

export interface ClientRtcConnectionStep4 extends WithPeerId {
  host: FileHost;
  clientHandler: StreamPacketClientHandler;
}

export interface HostRtcConnectionStep4 extends WithPeerId {
  clientHandle: RpcClientHandle;
  hostHandler: StreamPacketHostHandler;
}
