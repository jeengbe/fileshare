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

  protected getInformationResolves = new Map<
    string,
    (information: PeerInfo) => void
  >();

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
    const getInformationResolve = this.getInformationResolves.get(
      response.messageId,
    );

    if (!getInformationResolve) {
      throw new Error('Unexpected getInformation response');
    }

    getInformationResolve(response.information);

    this.getInformationResolves.delete(response.messageId);
  }
}
