import { Observable, Subject, filter, firstValueFrom, map } from 'rxjs';

export interface SignalingServerClient extends Disposable {
  offer$: Subject<[peerId: string, RTCSessionDescriptionInit]>;
  answer$: Subject<[peerId: string, RTCSessionDescriptionInit]>;
  iceCandidate$: Subject<[peerId: string, RTCIceCandidate]>;

  sendOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void>;

  sendAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void>;

  sendIceCandidate(peerId: string, candidate: RTCIceCandidate): Promise<void>;
}

export class WebRtcSignalingServer implements Disposable {
  public readonly request$ = new Subject<IncomingWebRtcConnectionRequest>();

  constructor(
    public readonly userId: string,
    public readonly rtcConfig: RTCConfiguration,
    private readonly client: SignalingServerClient,
  ) {
    client.offer$
      .pipe(
        map(([peerId, offer]): IncomingWebRtcConnectionRequest => {
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
      .subscribe(this.request$);
  }

  async sendRequest(
    request: OutgoingWebRtcConnectionRequest,
  ): Promise<OutgoingWebRtcConnectionRequestResponse> {
    const { peerId, offer } = request;

    await this.client.sendOffer(peerId, offer);

    const iceCandidate$ = this.client.iceCandidate$.pipe(
      filter(([candidatePeerId]) => candidatePeerId === peerId),
      map(([, candidate]) => candidate),
    );

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

  [Symbol.dispose](): void {
    this.client[Symbol.dispose]();
  }
}

export interface IncomingWebRtcConnectionRequest {
  iceCandidate$: Subject<RTCIceCandidate>;

  peerId: string;
  offer: RTCSessionDescriptionInit;

  sendAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  sendIceCandidate(candidate: RTCIceCandidate): Promise<void>;
}

interface OutgoingWebRtcConnectionRequest {
  peerId: string;
  offer: RTCSessionDescriptionInit;
}

export interface OutgoingWebRtcConnectionRequestResponse {
  iceCandidate$: Observable<RTCIceCandidate>;
  answer: Promise<RTCSessionDescriptionInit>;
  sendIceCandidate(candidate: RTCIceCandidate): Promise<void>;
}
