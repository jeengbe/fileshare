import { HostInformation } from '@/file-manager/domain/model/host-information';
import { FileUpdateListener } from '@/file-manager/domain/model/update';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { Subscription } from 'rxjs';
import { RpcClientHandler } from './client-handler';

export class RpcFileHost extends RpcClientHandler implements FileHost {
  getInformation(): Promise<HostInformation> {
    const id = crypto.randomUUID();

    return new Promise((resolve) => {
      this.getInformationResolves.set(id, resolve);

      this.hostHandle.sendGetInformationRequest({
        messageId: id,
      });
    });
  }

  subscribeToFileUpdates(listener: FileUpdateListener): Subscription {
    return this.fileUpdate$.subscribe(listener);
  }

  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | null> {
    const id = crypto.randomUUID();

    return new Promise((resolve) => {
      this.downloadFileResolves.set(id, resolve);

      this.hostHandle.sendFileDownloadRequest({
        messageId: id,
        fileId,
      });
    });
  }
}
