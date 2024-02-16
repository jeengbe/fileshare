import { FileDownloadRequest } from '../protocol';

export interface RpcHostHandler {
  onListFilesMetadataRequest(): Promise<void>;

  onFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
