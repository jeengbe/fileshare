import { FileDownloadRequest } from '../protocol';

export interface HostHandle {
  sendListFilesMetadataRequest(): Promise<void>;

  sendFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}
