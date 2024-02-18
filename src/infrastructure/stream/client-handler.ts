import { RpcClientHandler } from '../rpc/client-handler';
import { FileDownloadResponse } from '../rpc/protocol';
import { ChannelManager } from './channel-manager';
import { FileSharingDecoder } from './codec';
import { PacketType } from './protocol';
import { ArrayBufferToUint8ArrayTransformStream } from './util/array-buffer-uint-8-transform';
import { decodePacket } from './util/packet';
import { subscribeToReadable } from './util/read';

export class StreamPacketClientHandler {
  constructor(
    private readonly delegate: RpcClientHandler,
    private readonly readable: ReadableStream<ArrayBuffer>,
    private readonly channelManager: ChannelManager,
    private readonly decoder: FileSharingDecoder = new FileSharingDecoder(),
  ) {}

  async subscribe(): Promise<void> {
    await subscribeToReadable(this.readable, this.onMessage.bind(this));
  }

  private async onMessage(chunk: ArrayBuffer): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.GetInformationResponse:
        await this.onGetInformationResponse(payload);
        break;
      case PacketType.FileUpdateNotification:
        await this.onFileUpdateNotification(payload);
        break;
      case PacketType.FileDownloadResponse:
        await this.onFileDownloadResponse(payload);
        break;
    }
  }

  private async onGetInformationResponse(payload: ArrayBuffer): Promise<void> {
    const response = this.decoder.decodeGetInformationResponse(
      new Uint8Array(payload),
    );

    await this.delegate.onGetInformationResponse(response);
  }

  private async onFileUpdateNotification(payload: ArrayBuffer): Promise<void> {
    const notification = this.decoder.decodeFileUpdateNotification(
      new Uint8Array(payload),
    );

    await this.delegate.onFileUpdate(notification);
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

    await this.delegate.onFileDownloadResponse(response);
  }
}
