import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';

export interface OfferEvent {
  peerId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerEvent {
  peerId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateEvent {
  peerId: string;
  candidate: RTCIceCandidate;
}

export interface GetInformationResponse {
  information: PeerInfo;
}

export interface SendOfferRequest {
  peerId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerRequest {
  peerId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateRequest {
  peerId: string;
  candidate: RTCIceCandidate;
}
