import { FileHost } from '@/domain/service/file-host';
import { RpcClientHandle } from './interface/client-handle';
import { RpcHostHandler } from './interface/host-handler';
import { FileDownloadRequest } from './protocol';

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
