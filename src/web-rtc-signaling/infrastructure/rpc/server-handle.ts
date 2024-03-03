import {
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from './protocol';

export interface RpcServerHandle {
  sendGetInformationRequest(): void;

  sendSendOfferRequest(request: SendOfferRequest): void;

  sendSendAnswerRequest(request: SendAnswerRequest): void;

  sendSendIceCandidateRequest(request: SendIceCandidateRequest): void;
}
