import { SharedFileMetadata } from '@/domain/model/file';
import { FileUpdate, FileUpdateListener } from '@/domain/model/update';
import { FileHost } from '@/domain/service/file-host';
import { Subject, Subscription } from 'rxjs';
import { ClientHandler } from './interface/client-handler';
import { HostHandle } from './interface/host-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  ListFilesMetadataResponse,
} from './protocol';

export class NetworkFileHost implements FileHost, ClientHandler {
  private readonly fileUpdateSubject = new Subject<FileUpdate>();

  private listFilesMetadataResolve:
    | ((files: SharedFileMetadata[]) => void)
    | null = null;

  private downloadFileResolve:
    | ((file: ReadableStream<Uint8Array> | null) => void)
    | null = null;

  constructor(private readonly hostHandle: HostHandle) {}

  listFilesMetadata(): Promise<SharedFileMetadata[]> {
    if (this.listFilesMetadataResolve !== null) {
      throw new Error('Another listFilesMetadata request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.listFilesMetadataResolve = resolve;

      this.hostHandle.sendListFilesMetadataRequest().catch((err: Error) => {
        this.listFilesMetadataResolve = null;

        reject(err);
      });
    });
  }

  subscribeToFileUpdates(listener: FileUpdateListener): Subscription {
    return this.fileUpdateSubject.subscribe(listener);
  }

  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | null> {
    if (this.downloadFileResolve !== null) {
      throw new Error('Another downloadFile request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.downloadFileResolve = resolve;

      this.hostHandle
        .sendFileDownloadRequest({ fileId })
        .catch((err: Error) => {
          this.downloadFileResolve = null;

          reject(err);
        });
    });
  }

  async onListFilesMetadataResponse(
    response: ListFilesMetadataResponse,
  ): Promise<void> {
    if (!this.listFilesMetadataResolve) {
      throw new Error('Unexpected listFilesMetadata response');
    }

    this.listFilesMetadataResolve(response.files);

    this.listFilesMetadataResolve = null;
  }

  async onFileUpdate(notification: FileUpdateNotification): Promise<void> {
    this.fileUpdateSubject.next(notification.update);
  }

  async onFileDownloadResponse(response: FileDownloadResponse): Promise<void> {
    if (!this.downloadFileResolve) {
      throw new Error('Unexpected fileDownload response');
    }

    this.downloadFileResolve(response.stream);

    this.downloadFileResolve = null;
  }
}
