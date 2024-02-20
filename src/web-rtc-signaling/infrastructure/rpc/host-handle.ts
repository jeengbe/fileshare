import {
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from './protocol';

export interface RpcHostHandle {
  sendGetInformationRequest(): Promise<void>;

  sendSendOfferRequest(request: SendOfferRequest): Promise<void>;

  sendSendAnswerRequest(request: SendAnswerRequest): Promise<void>;

  sendSendIceCandidateRequest(request: SendIceCandidateRequest): Promise<void>;
}
