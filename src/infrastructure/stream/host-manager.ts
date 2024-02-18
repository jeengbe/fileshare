import { RpcFileHost } from '@/application/rpc/file-host';
import {
  HostEvent,
  HostEventType,
} from '@/application/rpc/interface/host-manager';
import { Observable } from 'rxjs';
import { StreamPacketClientHandler } from './packet/client-handler';
import { StreamPacketHostHandle } from './packet/host-handle';
import { PeerEvent, PeerEventType } from './peer-manager';

export interface HostManager {
  hostEvent$: Observable<HostEvent>;
}

export function peerEventToHostEvent(event: PeerEvent): HostEvent {
  switch (event.type) {
    case PeerEventType.Added: {
      const {
        peerId,
        connection: { readable, writable, channelManager },
      } = event;

      const hostHandle = new StreamPacketHostHandle(writable);

      const host = new RpcFileHost(hostHandle);

      const hostHandler = new StreamPacketClientHandler(
        host,
        readable,
        channelManager,
      );

      void hostHandler.subscribe();

      return {
        type: HostEventType.Added,
        hostId: peerId,
        host,
      };
    }

    case PeerEventType.Removed:
      return {
        type: HostEventType.Removed,
        hostId: event.peerId,
      };
  }
}
