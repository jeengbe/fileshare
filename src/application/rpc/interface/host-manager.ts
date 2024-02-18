import { FileHost } from '@/domain/service/file-host';

export type HostEvent = HostAddedEvent | HostRemovedEvent;

interface HostAddedEvent {
  type: HostEventType.Added;
  hostId: string;
  host: FileHost;
}

interface HostRemovedEvent {
  type: HostEventType.Removed;
  hostId: string;
}

export enum HostEventType {
  Added,
  Removed,
}
