import { HostInformation } from '@/file-host/model/host-information';
import { FileUpdate, FileUpdateListener } from '@/file-host/model/update';
import { FileHost } from '@/file-host/service/file-host';
import { Subject, Subscription } from 'rxjs';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from './protocol';
import { RpcClientHandler } from './service/client-handler';
import { RpcHostHandle } from './service/host-handle';

export class RpcFileHost implements FileHost, RpcClientHandler {
  private readonly fileUpdateSubject = new Subject<FileUpdate>();

  private getInformationResolve:
    | ((information: HostInformation) => void)
    | null = null;

  private downloadFileResolve:
    | ((file: ReadableStream<Uint8Array> | null) => void)
    | null = null;

  constructor(private readonly hostHandle: RpcHostHandle) {}

  getInformation(): Promise<HostInformation> {
    if (this.getInformationResolve !== null) {
      throw new Error('Another listFilesMetadata request is in progress');
    }

    return new Promise((resolve, reject) => {
      this.getInformationResolve = resolve;

      this.hostHandle.sendGetInformationRequest().catch((err: Error) => {
        this.getInformationResolve = null;

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

  async onGetInformationResponse(
    response: GetInformationResponse,
  ): Promise<void> {
    if (!this.getInformationResolve) {
      throw new Error('Unexpected getInformation response');
    }

    this.getInformationResolve(response.information);

    this.getInformationResolve = null;
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