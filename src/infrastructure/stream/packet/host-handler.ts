import { RpcHostHandler } from '@/application/rpc/interface/host-handler';
import { decodePacket } from '../../util/packet';
import { subscribeToReadable } from '../../util/read';
import { FileSharingDecoder } from '../codec';
import { PacketType } from '../protocol';
import { StreamPacketClientHandle } from './client-handle';

export class StreamPacketHostHandler {
  constructor(
    private readonly clientHandle: StreamPacketClientHandle,
    private readonly readable: ReadableStream<ArrayBuffer>,
    private readonly host: RpcHostHandler,
    private readonly decoder: FileSharingDecoder,
  ) {}

  async subscribe(): Promise<void> {
    await subscribeToReadable(this.readable, this.onMessage.bind(this));
  }

  private async onMessage(chunk: ArrayBuffer): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.ListFilesMetadataRequest:
        await this.onListFilesMetadataRequest();
        break;
      case PacketType.FileDownloadRequest:
        await this.onFileDownloadRequest(payload);
        break;
      case PacketType.FileDownloadResponseAck:
        await this.onFileDownloadResponseAck();
        break;
    }
  }

  private async onListFilesMetadataRequest(): Promise<void> {
    await this.host.onListFilesMetadataRequest();
  }

  private async onFileDownloadRequest(payload: ArrayBuffer): Promise<void> {
    const request = this.decoder.decodeFileDownloadRequest(
      new Uint8Array(payload),
    );

    await this.host.onFileDownloadRequest(request);
  }

  private async onFileDownloadResponseAck(): Promise<void> {
    await this.clientHandle.startDownloadStream();
  }
}
