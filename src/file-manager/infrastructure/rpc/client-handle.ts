import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from './protocol';

export interface RpcClientHandle {
  sendGetInformationResponse(response: GetInformationResponse): void;

  sendFileUpdate(notification: FileUpdateNotification): void;

  sendFileDownloadResponse(response: FileDownloadResponse): void;
}
