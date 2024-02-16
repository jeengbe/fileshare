import { FileHost } from '@/domain/service/file-host';
import { ClientHandle } from './interface/client-handle';
import { HostHandler } from './interface/host-handler';
import { FileDownloadRequest } from './protocol';

export class NetworkHostHandler implements HostHandler {
  constructor(
    private readonly fileHostService: FileHost,
    private readonly clientHandle: ClientHandle,
  ) {
    this.fileHostService.subscribeToFileUpdates((update) => {
      void this.clientHandle.sendFileUpdate({
        update,
      });
    });
  }

  async onListFilesMetadataRequest(): Promise<void> {
    const files = await this.fileHostService.listFilesMetadata();

    return this.clientHandle.sendListFilesMetadataResponse({
      files,
    });
  }

  async onFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const stream = await this.fileHostService.downloadFile(request.fileId);

    return this.clientHandle.sendFileDownloadResponse({
      stream,
    });
  }
}
