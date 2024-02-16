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

  async onListFilesMetadataRequest(): Promise<void> {
    const files = await this.fileHost.listFilesMetadata();

    return this.clientHandle.sendListFilesMetadataResponse({
      files,
    });
  }

  async onFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const stream = await this.fileHost.downloadFile(request.fileId);

    return this.clientHandle.sendFileDownloadResponse({
      stream,
    });
  }
}
