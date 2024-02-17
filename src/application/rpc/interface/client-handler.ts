import {
  FileDownloadResponse,
  FileUpdateNotification,
  ListFilesMetadataResponse,
} from '../protocol';

export interface RpcClientHandler {
  onListFilesMetadataResponse(
    response: ListFilesMetadataResponse,
  ): Promise<void>;

  onFileUpdate(notification: FileUpdateNotification): Promise<void>;

  onFileDownloadResponse(response: FileDownloadResponse): Promise<void>;
}