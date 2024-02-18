import { PeerManager } from '@/file-host-peer/peer-manager';

export interface SignalingServer extends PeerManager {
  connect(): Promise<Identity>;
}

export interface Identity {
  id: string;
}
