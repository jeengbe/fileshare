import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { SignalingService } from '@/web-rtc-signaling/domain/service/signaling-service';
import { Subject, filter, firstValueFrom, map } from 'rxjs';

export interface IncomingWebRtcConnection {
  iceCandidate$: Subject<RTCIceCandidate>;

  fromId: string;
  offer: RTCSessionDescriptionInit;

  sendAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  sendIceCandidate(candidate: RTCIceCandidate): Promise<void>;
}

export interface OutgoingWebRtcConnectionRequest {
  toId: string;
  offer: RTCSessionDescriptionInit;
}

export interface OutgoingWebRtcConnection {
  iceCandidate$: Subject<RTCIceCandidate>;

  answer: Promise<RTCSessionDescriptionInit>;

  sendIceCandidate(candidate: RTCIceCandidate): Promise<void>;
}

export class WebRtcSignalingServer {
  public readonly incoming$ = new Subject<IncomingWebRtcConnection>();

  constructor(
    public readonly info: PeerInfo,
    private readonly service: SignalingService,
  ) {
    service.offer$
      .pipe(
        map(([fromId, offer]): IncomingWebRtcConnection => {
          const iceCandidate$ = new Subject<RTCIceCandidate>();

          service.iceCandidate$
            .pipe(
              filter(([candidatePeerId]) => candidatePeerId === fromId),
              map(([, candidate]) => candidate),
            )
            .subscribe(iceCandidate$);

          return {
            iceCandidate$,
            fromId,
            offer,
            sendAnswer: (answer) => service.sendAnswer(fromId, answer),
            sendIceCandidate: (candidate) =>
              service.sendIceCandidate(fromId, candidate),
          };
        }),
      )
      .subscribe(this.incoming$);
  }

  async sendRequest(
    request: OutgoingWebRtcConnectionRequest,
  ): Promise<OutgoingWebRtcConnection> {
    const { toId, offer } = request;

    await this.service.sendOffer(toId, offer);

    const iceCandidate$ = new Subject<RTCIceCandidate>();

    this.service.iceCandidate$
      .pipe(
        filter(([candidatePeerId]) => candidatePeerId === toId),
        map(([, candidate]) => candidate),
      )
      .subscribe(iceCandidate$);

    const answerPromise = firstValueFrom(
      this.service.answer$.pipe(
        filter(([answerPeerId]) => answerPeerId === toId),
        map(([, answer]) => answer),
      ),
    );

    return {
      iceCandidate$,
      answer: answerPromise,
      sendIceCandidate: (candidate) =>
        this.service.sendIceCandidate(toId, candidate),
    };
  }
}
