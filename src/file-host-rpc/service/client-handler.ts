import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from '../protocol';

export interface RpcClientHandler {
  onGetInformationResponse(response: GetInformationResponse): Promise<void>;

  onFileUpdate(notification: FileUpdateNotification): Promise<void>;

  onFileDownloadResponse(response: FileDownloadResponse): Promise<void>;
}
