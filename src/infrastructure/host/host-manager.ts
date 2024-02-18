import { Observable } from 'rxjs';
import { PeerEvent, PeerEventType } from '../peer/peer-event';
import { RpcFileHost } from '../rpc/client-handler';
import { StreamPacketClientHandler } from '../stream/client-handler';
import { StreamPacketHostHandle } from '../stream/host-handle';
import { HostEvent, HostEventType } from './host-event';

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