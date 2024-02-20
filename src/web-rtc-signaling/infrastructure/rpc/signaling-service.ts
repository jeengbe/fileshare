import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { SignalingService } from '@/web-rtc-signaling/domain/service/signaling-service';
import { Subject, map } from 'rxjs';
import { RpcClientHandler } from './client-handler';
import { RpcHostHandle } from './host-handle';

export class RpcSignalingService
  extends RpcClientHandler
  implements SignalingService
{
  public readonly offer$ = new Subject<
    readonly [peerId: string, RTCSessionDescriptionInit]
  >();
  public readonly answer$ = new Subject<
    readonly [peerId: string, RTCSessionDescriptionInit]
  >();
  public readonly iceCandidate$ = new Subject<
    readonly [peerId: string, RTCIceCandidate]
  >();

  constructor(hostHandle: RpcHostHandle) {
    super(hostHandle);

    this.offerEvent$
      .pipe(map((event) => [event.peerId, event.offer] as const))
      .subscribe(this.offer$);

    this.answerEvent$
      .pipe(map((event) => [event.peerId, event.answer] as const))
      .subscribe(this.answer$);

    this.iceCandidateEvent$
      .pipe(map((event) => [event.peerId, event.candidate] as const))
      .subscribe(this.iceCandidate$);
  }

  getInfo(): Promise<PeerInfo> {
    if (this.getInformationResolve !== null) {
      throw new Error('Another getInformation request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.getInformationResolve = resolve;

      this.hostHandle.sendGetInformationRequest().catch((err: Error) => {
        this.getInformationResolve = null;

        reject(err);
      });
    });
  }

  sendOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (this.sendOfferResolve !== null) {
      throw new Error('Another sendOffer request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.sendOfferResolve = resolve;

      this.hostHandle
        .sendSendOfferRequest({ peerId, offer })
        .catch((err: Error) => {
          reject(err);
        })
        .finally(() => {
          this.sendOfferResolve = null;
        });
    });
  }

  sendAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.sendAnswerResolve !== null) {
      throw new Error('Another sendAnswer request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.sendAnswerResolve = resolve;

      this.hostHandle
        .sendSendAnswerRequest({ peerId, answer })
        .catch((err: Error) => {
          reject(err);
        })
        .finally(() => {
          this.sendAnswerResolve = null;
        });
    });
  }

  sendIceCandidate(peerId: string, candidate: RTCIceCandidate): Promise<void> {
    if (this.sendIceCandidateResolve !== null) {
      throw new Error('Another sendIceCandidate request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.sendIceCandidateResolve = resolve;

      this.hostHandle
        .sendSendIceCandidateRequest({ peerId, candidate })
        .catch((err: Error) => {
          reject(err);
        })
        .finally(() => {
          this.sendIceCandidateResolve = null;
        });
    });
  }
}
