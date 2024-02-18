import { PeerEvent } from '@/infrastructure/stream/peer-manager';
import { Subject } from 'rxjs';
import { Identity, SignalingServer } from '.';

export class WebRtcSignalingServer implements SignalingServer {
  readonly peerEvent$ = new Subject<PeerEvent>();

  private static SIGNALING_SERVER_URL = 'wss://localhost:4000';

  connect(): Promise<Identity> {
    throw new Error('Method not implemented.');
  }
}
