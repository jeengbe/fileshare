/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { decodePacket } from '@/util/stream/packet';
import { RpcHostHandler } from '../rpc/host-handler';
import { FileSharingDecoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandler {
  constructor(
    private readonly rpcHandler: RpcHostHandler,
    private readonly decoder = new FileSharingDecoder(),
  ) {}

  async onMessage(chunk: ArrayBufferLike): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.GetInformationRequest:
        await this.onGetInformationRequest(payload);
        break;
      case PacketType.FileDownloadRequest:
        await this.onFileDownloadRequest(payload);
        break;
      default:
        throw new Error('Unknown packet type');
    }
  }

  private async onGetInformationRequest(
    payload: ArrayBufferLike,
  ): Promise<void> {
    const request = this.decoder.decodeGetInformationRequest(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onGetInformationRequest(request);
  }

  private async onFileDownloadRequest(payload: ArrayBufferLike): Promise<void> {
    const request = this.decoder.decodeFileDownloadRequest(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onFileDownloadRequest(request);
  }
}
