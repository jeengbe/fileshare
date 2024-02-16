import { FileDownloadRequest } from '../protocol';

export interface HostHandler {
  onListFilesMetadataRequest(): Promise<void>;

  onFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
