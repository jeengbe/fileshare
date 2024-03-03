import { FileDownloadRequest } from './protocol';

export interface RpcHostHandle {
  sendGetInformationRequest(): void;

  sendFileDownloadRequest(request: FileDownloadRequest): void;
}
