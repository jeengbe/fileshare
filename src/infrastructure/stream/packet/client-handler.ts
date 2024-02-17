import { RpcClientHandler } from '@/application/rpc/interface/client-handler';
import { FileDownloadResponse } from '@/application/rpc/protocol';
import { ArrayBufferToUint8ArrayTransformStream } from '@/infrastructure/util/array-buffer-uint-8-transform';
import { decodePacket } from '../../util/packet';
import { subscribeToReadable } from '../../util/read';
import { ChannelManager } from '../channel-manager';
import { FileSharingDecoder } from '../codec';
import { PacketType } from '../protocol';

export class StreamPacketClientHandler {
  constructor(
    private readonly readable: ReadableStream<ArrayBuffer>,
    private readonly client: RpcClientHandler,
    private readonly decoder: FileSharingDecoder,
    private readonly channelManager: ChannelManager,
  ) {}

  async subscribe(): Promise<void> {
    await subscribeToReadable(this.readable, this.onMessage.bind(this));
  }

  async onMessage(chunk: ArrayBuffer): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.ListFilesMetadataResponse:
        await this.onFilesMetadataResponse(payload);
        break;
      case PacketType.FileUpdateNotification:
        await this.onFileUpdateNotification(payload);
        break;
      case PacketType.FileDownloadResponse:
        await this.onFileDownloadResponse(payload);
        break;
    }
  }

  private async onFilesMetadataResponse(payload: ArrayBuffer): Promise<void> {
    const response = this.decoder.decodeListFilesMetadataResponse(
      new Uint8Array(payload),
    );

    await this.client.onListFilesMetadataResponse(response);
  }

  private async onFileUpdateNotification(payload: ArrayBuffer): Promise<void> {
    const notification = this.decoder.decodeFileUpdateNotification(
      new Uint8Array(payload),
    );

    await this.client.onFileUpdate(notification);
  }

  private async onFileDownloadResponse(payload: ArrayBuffer): Promise<void> {
    const responsePacket = this.decoder.decodeFileDownloadResponse(
      new Uint8Array(payload),
    );

    let response: FileDownloadResponse;

    if (responsePacket.channelId) {
      const stream = await this.channelManager.getReadable(
        responsePacket.channelId,
      );

      response = {
        stream: stream.pipeThrough(
          new ArrayBufferToUint8ArrayTransformStream(),
        ),
      };
    } else {
      response = {
        stream: null,
      };
    }

    await this.client.onFileDownloadResponse(response);
  }
}
