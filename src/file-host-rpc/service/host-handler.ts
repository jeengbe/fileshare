import { FileDownloadRequest } from '../protocol';

export interface RpcHostHandler {
  onGetInformationRequest(): Promise<void>;

  onFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
