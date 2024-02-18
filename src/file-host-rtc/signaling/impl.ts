import { PeerEvent } from '@/file-host-peer/model/peer-event';
import { Subject } from 'rxjs';
import { Identity, SignalingServer } from '.';

export class RtcSignalingServer implements SignalingServer {
  readonly peerEvent$ = new Subject<PeerEvent>();

  connect(): Promise<Identity> {
    throw new Error('Method not implemented.');
  }
}
