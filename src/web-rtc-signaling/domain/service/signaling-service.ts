import { Subject } from 'rxjs';
import { PeerInfo } from '../model/info';

export interface SignalingService {
  offer$: Subject<readonly [fromId: string, RTCSessionDescriptionInit]>;
  answer$: Subject<readonly [fromId: string, RTCSessionDescriptionInit]>;
  iceCandidate$: Subject<readonly [fromId: string, RTCIceCandidate]>;

  getInfo(): Promise<PeerInfo>;

  sendOffer(toId: string, offer: RTCSessionDescriptionInit): void;

  sendAnswer(toId: string, answer: RTCSessionDescriptionInit): void;

  sendIceCandidate(toId: string, candidate: RTCIceCandidate): void;
}
