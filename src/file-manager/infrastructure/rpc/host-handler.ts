import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcClientHandle } from './client-handle';
import { FileDownloadRequest } from './protocol';

export class RpcHostHandler {
  constructor(
    private readonly fileHost: FileHost,
    private readonly clientHandle: RpcClientHandle,
  ) {
    this.fileHost.subscribeToFileUpdates((update) => {
      this.clientHandle.sendFileUpdate({
        update,
      });
    });
  }

  async onGetInformationRequest(): Promise<void> {
    const information = await this.fileHost.getInformation();

    this.clientHandle.sendGetInformationResponse({
      information,
    });
  }

  async onFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const stream = await this.fileHost.downloadFile(request.fileId);

    this.clientHandle.sendFileDownloadResponse({
      stream,
    });
  }
}
