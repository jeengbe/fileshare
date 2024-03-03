import { HostInformation } from '@/file-manager/domain/model/host-information';
import { FileUpdateListener } from '@/file-manager/domain/model/update';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { Subscription } from 'rxjs';
import { RpcClientHandler } from './client-handler';

export class RpcFileHost extends RpcClientHandler implements FileHost {
  getInformation(): Promise<HostInformation> {
    if (this.getInformationResolve !== null) {
      // throw new Error('Another listFilesMetadata request is in progress');
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
    return this.fileUpdate$.subscribe(listener);
  }

  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | null> {
    if (this.downloadFileResolve !== null) {
      // throw new Error('Another downloadFile request is in progress');
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
}
