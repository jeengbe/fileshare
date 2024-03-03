import {
  GetInformationRequest,
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from './protocol';

export interface RpcServerHandle {
  sendGetInformationRequest(request: GetInformationRequest): void;

  sendSendOfferRequest(request: SendOfferRequest): void;

  sendSendAnswerRequest(request: SendAnswerRequest): void;

  sendSendIceCandidateRequest(request: SendIceCandidateRequest): void;
}
