import { FileHost } from '@/file-host/service/file-host';
import { FileDownloadRequest } from './protocol';
import { RpcClientHandle } from './service/client-handle';
import { RpcHostHandler } from './service/host-handler';

export class RpcHostHandlerImpl implements RpcHostHandler {
  constructor(
    private readonly fileHost: FileHost,
    private readonly clientHandle: RpcClientHandle,
  ) {
    this.fileHost.subscribeToFileUpdates((update) => {
      void this.clientHandle.sendFileUpdate({
        update,
      });
    });
  }

  async onGetInformationRequest(): Promise<void> {
    const information = await this.fileHost.getInformation();

    return this.clientHandle.sendGetInformationResponse({
      information,
    });
  }

  async onFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const stream = await this.fileHost.downloadFile(request.fileId);

    return this.clientHandle.sendFileDownloadResponse({
      stream,
    });
  }
}
