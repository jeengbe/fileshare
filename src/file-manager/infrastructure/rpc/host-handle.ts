import { FileDownloadRequest, GetInformationRequest } from './protocol';

export interface RpcHostHandle {
  sendGetInformationRequest(request: GetInformationRequest): void;

  sendFileDownloadRequest(request: FileDownloadRequest): void;
}
