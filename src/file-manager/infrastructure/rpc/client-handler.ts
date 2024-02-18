import { HostInformation } from '@/file-manager/domain/model/host-information';
import { FileUpdate } from '@/file-manager/domain/model/update';
import { Subject } from 'rxjs';
import { RpcHostHandle } from './host-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from './protocol';

export class RpcClientHandler {
  protected readonly fileUpdateSubject = new Subject<FileUpdate>();

  protected getInformationResolve:
    | ((information: HostInformation) => void)
    | null = null;

  protected downloadFileResolve:
    | ((file: ReadableStream<Uint8Array> | null) => void)
    | null = null;

  constructor(protected readonly hostHandle: RpcHostHandle) {}

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
