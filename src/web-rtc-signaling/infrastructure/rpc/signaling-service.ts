import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { SignalingService } from '@/web-rtc-signaling/domain/service/signaling-service';
import { Subject, map } from 'rxjs';
import { RpcClientHandler } from './client-handler';
import { RpcServerHandle } from './server-handle';

export class RpcSignalingService
  extends RpcClientHandler
  implements SignalingService
{
  public readonly offer$ = new Subject<
    readonly [fromId: string, RTCSessionDescriptionInit]
  >();
  public readonly answer$ = new Subject<
    readonly [fromId: string, RTCSessionDescriptionInit]
  >();
  public readonly iceCandidate$ = new Subject<
    readonly [fromId: string, RTCIceCandidate]
  >();

  constructor(private readonly rpcServerHandle: RpcServerHandle) {
    super();

    this.offerEvent$
      .pipe(map((event) => [event.fromId, event.offer] as const))
      .subscribe(this.offer$);

    this.answerEvent$
      .pipe(map((event) => [event.fromId, event.answer] as const))
      .subscribe(this.answer$);

    this.iceCandidateEvent$
      .pipe(map((event) => [event.fromId, event.candidate] as const))
      .subscribe(this.iceCandidate$);
  }

  getInfo(): Promise<PeerInfo> {
    const id = crypto.randomUUID();

    return new Promise((resolve) => {
      this.getInformationResolves.set(id, resolve);

      this.rpcServerHandle.sendGetInformationRequest({
        messageId: id,
      });
    });
  }

  sendOffer(toId: string, offer: RTCSessionDescriptionInit): void {
    this.rpcServerHandle.sendSendOfferRequest({ toId, offer });
  }

  sendAnswer(toId: string, answer: RTCSessionDescriptionInit): void {
    this.rpcServerHandle.sendSendAnswerRequest({ toId, answer });
  }

  sendIceCandidate(toId: string, candidate: RTCIceCandidate): void {
    this.rpcServerHandle.sendSendIceCandidateRequest({ toId, candidate });
  }
}
