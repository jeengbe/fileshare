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
  protected readonly fileUpdate$ = new Subject<FileUpdate>();

  protected getInformationResolves = new Map<
    string,
    (information: HostInformation) => void
  >();

  protected downloadFileResolves = new Map<
    string,
    (file: ReadableStream<Uint8Array> | null) => void
  >();

  constructor(protected readonly hostHandle: RpcHostHandle) {}

  async onGetInformationResponse(
    response: GetInformationResponse,
  ): Promise<void> {
    const getInformationResolve = this.getInformationResolves.get(
      response.messageId,
    );

    if (!getInformationResolve) {
      throw new Error('Unexpected getInformation response');
    }

    getInformationResolve(response.information);

    this.getInformationResolves.delete(response.messageId);
  }

  async onFileUpdate(notification: FileUpdateNotification): Promise<void> {
    this.fileUpdate$.next(notification.update);
  }

  async onFileDownloadResponse(response: FileDownloadResponse): Promise<void> {
    const downloadFileResolve = this.downloadFileResolves.get(
      response.messageId,
    );

    if (!downloadFileResolve) {
      throw new Error('Unexpected fileDownload response');
    }

    downloadFileResolve(response.stream);

    this.downloadFileResolves.delete(response.messageId);
  }
}
