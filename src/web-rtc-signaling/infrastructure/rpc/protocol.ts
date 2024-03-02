import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';

export interface OfferEvent {
  fromId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerEvent {
  fromId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateEvent {
  fromId: string;
  candidate: RTCIceCandidate;
}

export interface GetInformationResponse {
  information: PeerInfo;
}

export interface SendOfferRequest {
  toId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerRequest {
  toId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateRequest {
  toId: string;
  candidate: RTCIceCandidate;
}
