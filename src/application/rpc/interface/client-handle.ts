import {
  FileDownloadResponse,
  FileUpdateNotification,
  ListFilesMetadataResponse,
} from '../protocol';

export interface RpcClientHandle {
  sendListFilesMetadataResponse(
    response: ListFilesMetadataResponse,
  ): Promise<void>;

  sendFileUpdate(notification: FileUpdateNotification): Promise<void>;

  sendFileDownloadResponse(response: FileDownloadResponse): Promise<void>;
}
