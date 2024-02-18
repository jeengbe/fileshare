import { FileDownloadRequest } from './protocol';

export interface RpcHostHandle {
  sendGetInformationRequest(): Promise<void>;

  sendFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
