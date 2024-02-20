import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { SignalingService } from '@/web-rtc-signaling/domain/service/signaling-service';
import { Subject, filter, firstValueFrom, map } from 'rxjs';

export interface IncomingWebRtcConnection {
  iceCandidate$: Subject<RTCIceCandidate>;

  peerId: string;
  offer: RTCSessionDescriptionInit;

  sendAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  sendIceCandidate(candidate: RTCIceCandidate): Promise<void>;
}

export interface OutgoingWebRtcConnectionRequest {
  peerId: string;
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
    private readonly client: SignalingService,
  ) {
    client.offer$
      .pipe(
        map(([peerId, offer]): IncomingWebRtcConnection => {
          const iceCandidate$ = new Subject<RTCIceCandidate>();

          client.iceCandidate$
            .pipe(
              filter(([candidatePeerId]) => candidatePeerId === peerId),
              map(([, candidate]) => candidate),
            )
            .subscribe(iceCandidate$);

          return {
            iceCandidate$,
            peerId,
            offer,
            sendAnswer: (answer) => client.sendAnswer(peerId, answer),
            sendIceCandidate: (candidate) =>
              client.sendIceCandidate(peerId, candidate),
          };
        }),
      )
      .subscribe(this.incoming$);
  }

  async sendRequest(
    request: OutgoingWebRtcConnectionRequest,
  ): Promise<OutgoingWebRtcConnection> {
    const { peerId, offer } = request;

    await this.client.sendOffer(peerId, offer);

    const iceCandidate$ = new Subject<RTCIceCandidate>();

    this.client.iceCandidate$
      .pipe(
        filter(([candidatePeerId]) => candidatePeerId === peerId),
        map(([, candidate]) => candidate),
      )
      .subscribe(iceCandidate$);

    const answerPromise = firstValueFrom(
      this.client.answer$.pipe(
        filter(([answerPeerId]) => answerPeerId === peerId),
        map(([, answer]) => answer),
      ),
    );

    return {
      iceCandidate$,
      answer: answerPromise,
      sendIceCandidate: (candidate) =>
        this.client.sendIceCandidate(peerId, candidate),
    };
  }
}
