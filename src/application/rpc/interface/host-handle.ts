import { FileDownloadRequest } from '../protocol';

export interface RpcHostHandle {
  sendListFilesMetadataRequest(): Promise<void>;

  sendFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
