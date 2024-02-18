import { HostEvent, HostEventType } from '@/file-host-host/model/host-event';
import { RpcFileHost } from '@/file-host-rpc/file-host';
import { StreamPacketClientHandler } from '@/file-host-stream/packet/client-handler';
import { StreamPacketHostHandle } from '@/file-host-stream/packet/host-handle';
import { PeerEvent, PeerEventType } from './model/peer-event';

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
