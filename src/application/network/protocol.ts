import { SharedFileMetadata } from '@/domain/model/file';
import { FileUpdate } from '@/domain/model/update';

export interface ListFilesMetadataResponse {
  files: SharedFileMetadata[];
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
