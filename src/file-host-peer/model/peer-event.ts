import { PeerConnection } from './peer-connection';

export type PeerEvent = PeerAddedEvent | PeerRemovedEvent;

interface PeerAddedEvent {
  type: PeerEventType.Added;
  peerId: string;
  connection: PeerConnection;
}

interface PeerRemovedEvent {
  type: PeerEventType.Removed;
  peerId: string;
}

export enum PeerEventType {
  Added,
  Removed,
}
