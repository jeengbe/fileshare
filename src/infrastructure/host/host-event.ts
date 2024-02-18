import { RpcFileHost } from '../rpc/client-handler';

export type HostEvent = HostAddedEvent | HostRemovedEvent;

interface HostAddedEvent {
  type: HostEventType.Added;
  hostId: string;
  host: RpcFileHost;
}

interface HostRemovedEvent {
  type: HostEventType.Removed;
  hostId: string;
}

export enum HostEventType {
  Added,
  Removed,
}
