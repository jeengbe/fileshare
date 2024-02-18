import { Observable } from 'rxjs';
import { PeerEvent } from './model/peer-event';

export interface PeerManager {
  peerEvent$: Observable<PeerEvent>;
}
