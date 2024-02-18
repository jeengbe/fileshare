import { Observable } from 'rxjs';
import { ChannelManager } from './channel-manager';

export type PeerEvent = PeerAddedEvent | PeerRemovedEvent;

export interface PeerConnection {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  channelManager: ChannelManager;
}

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

export interface PeerManager {
  peerEvent$: Observable<PeerEvent>;
}
