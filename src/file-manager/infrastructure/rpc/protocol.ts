import { HostInformation } from '@/file-manager/domain/model/host-information';
import { FileUpdate } from '@/file-manager/domain/model/update';

export interface GetInformationRequest {
  messageId: string;
}

export interface GetInformationResponse {
  messageId: string;
  information: HostInformation;
}

export interface FileUpdateNotification {
  update: FileUpdate;
}

export interface FileDownloadRequest {
  messageId: string;
  fileId: string;
}

export interface FileDownloadResponse {
  messageId: string;
  stream: ReadableStream<Uint8Array> | null;
}
