import { HostEvent } from '@/file-host-host/model/host-event';
import { HostManager } from '@/file-host-host/service/host-manager';
import { peerEventToHostEvent } from '@/file-host-peer/host-manager';
import { Subject, map } from 'rxjs';
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
