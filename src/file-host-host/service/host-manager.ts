import { Observable } from 'rxjs';
import { HostEvent } from '../model/host-event';

export interface HostManager {
  hostEvent$: Observable<HostEvent>;
}
