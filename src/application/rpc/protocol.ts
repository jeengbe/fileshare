import { HostInformation } from '@/domain/model/host-information';
import { FileUpdate } from '@/domain/model/update';

export interface GetInformationResponse {
  information: HostInformation;
}

export interface FileUpdateNotification {
  update: FileUpdate;
}

export interface FileDownloadRequest {
  fileId: string;
}

export interface FileDownloadResponse {
  stream: ReadableStream<Uint8Array> | null;
}
