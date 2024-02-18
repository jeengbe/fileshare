import { Observable } from 'rxjs';
import { PeerEvent } from './peer-event';

export interface PeerManager {
  peerEvent$: Observable<PeerEvent>;
}
