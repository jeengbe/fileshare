/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { ChannelManager } from '@/connection/channel-manager';
import { decodePacket } from '@/util/stream/packet';
import { RpcClientHandler } from '../rpc/client-handler';
import { FileDownloadResponse } from '../rpc/protocol';
import { FileSharingDecoder } from './codec';
import { PacketType } from './protocol';
import { ArrayBufferToUint8ArrayTransformStream } from './util/array-buffer-uint-8-transform';

export class StreamPacketClientHandler {
  constructor(
    private readonly rpcHandler: RpcClientHandler,
    private readonly channelManager: ChannelManager,
    private readonly decoder = new FileSharingDecoder(),
  ) {}

  async onMessage(chunk: ArrayBufferLike): Promise<void> {
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
      default:
        throw new Error('Unknown packet type');
    }
  }

  private async onGetInformationResponse(
    payload: ArrayBufferLike,
  ): Promise<void> {
    const response = this.decoder.decodeGetInformationResponse(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onGetInformationResponse(response);
  }

  private async onFileUpdateNotification(
    payload: ArrayBufferLike,
  ): Promise<void> {
    const notification = this.decoder.decodeFileUpdateNotification(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onFileUpdate(notification);
  }

  private async onFileDownloadResponse(
    payload: ArrayBufferLike,
  ): Promise<void> {
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

    await this.rpcHandler.onFileDownloadResponse(response);
  }
}
