import { Subject } from 'rxjs';
import { PeerInfo } from '../model/info';

export interface SignalingService {
  offer$: Subject<readonly [peerId: string, RTCSessionDescriptionInit]>;
  answer$: Subject<readonly [peerId: string, RTCSessionDescriptionInit]>;
  iceCandidate$: Subject<readonly [peerId: string, RTCIceCandidate]>;

  getInfo(): Promise<PeerInfo>;

  sendOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void>;

  sendAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void>;

  sendIceCandidate(peerId: string, candidate: RTCIceCandidate): Promise<void>;
}
