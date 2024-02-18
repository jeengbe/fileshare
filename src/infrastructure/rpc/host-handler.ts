import { FileHost } from '@/domain/service/file-host';
import { RpcClientHandle } from './client-handle';
import { FileDownloadRequest } from './protocol';

export interface RpcHostHandler {
  onGetInformationRequest(): Promise<void>;

  onFileDownloadRequest(request: FileDownloadRequest): Promise<void>;
}

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