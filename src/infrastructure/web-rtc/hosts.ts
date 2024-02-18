import { HostEvent } from '@/application/rpc/interface/host-manager';
import { Subject, map } from 'rxjs';
import { HostManager, peerEventToHostEvent } from '../stream/host-manager';
import { Identity, SignalingServer } from './signaling';

export class WebRtcHostManager implements HostManager {
  readonly hostEvent$ = new Subject<HostEvent>();

  constructor(private readonly signalingServer: SignalingServer) {}

  async connect(): Promise<Identity> {
    const identity = await this.signalingServer.connect();

    this.signalingServer.peerEvent$
      .pipe(map(peerEventToHostEvent))
      .subscribe(this.hostEvent$);

    return identity;
  }
}
