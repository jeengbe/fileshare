import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from '../protocol';

export interface RpcClientHandle {
  sendGetInformationResponse(response: GetInformationResponse): Promise<void>;

  sendFileUpdate(notification: FileUpdateNotification): Promise<void>;

  sendFileDownloadResponse(response: FileDownloadResponse): Promise<void>;
}
