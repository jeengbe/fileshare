import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { Subject } from 'rxjs';
import {
  AnswerEvent,
  GetInformationResponse,
  IceCandidateEvent,
  OfferEvent,
} from './protocol';

export class RpcClientHandler {
  protected readonly offerEvent$ = new Subject<OfferEvent>();
  protected readonly answerEvent$ = new Subject<AnswerEvent>();
  protected readonly iceCandidateEvent$ = new Subject<IceCandidateEvent>();

  protected getInformationResolve: ((information: PeerInfo) => void) | null =
    null;

  protected sendOfferResolve: (() => void) | null = null;

  protected sendAnswerResolve: (() => void) | null = null;

  protected sendIceCandidateResolve: (() => void) | null = null;

  async onOfferEvent(event: OfferEvent): Promise<void> {
    this.offerEvent$.next(event);
  }

  async onAnswerEvent(event: AnswerEvent): Promise<void> {
    this.answerEvent$.next(event);
  }

  async onIceCandidateEvent(event: IceCandidateEvent): Promise<void> {
    this.iceCandidateEvent$.next(event);
  }

  async onGetInformationResponse(
    response: GetInformationResponse,
  ): Promise<void> {
    if (!this.getInformationResolve) {
      throw new Error('Unexpected getInformation response');
    }

    this.getInformationResolve(response.information);

    this.getInformationResolve = null;
  }

  async onSendOfferResponse(): Promise<void> {
    if (!this.sendOfferResolve) {
      throw new Error('Unexpected sendOffer response');
    }

    this.sendOfferResolve();

    this.sendOfferResolve = null;
  }

  async onSendAnswerResponse(): Promise<void> {
    if (!this.sendAnswerResolve) {
      throw new Error('Unexpected sendAnswer response');
    }

    this.sendAnswerResolve();

    this.sendAnswerResolve = null;
  }

  async onSendIceCandidateResponse(): Promise<void> {
    if (!this.sendIceCandidateResolve) {
      throw new Error('Unexpected sendIceCandidate response');
    }

    this.sendIceCandidateResolve();

    this.sendIceCandidateResolve = null;
  }
}
