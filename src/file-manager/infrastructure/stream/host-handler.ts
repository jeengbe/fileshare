/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { decodePacket } from '@/util/stream/packet';
import { subscribeToReadable } from '@/util/stream/read';
import { RpcHostHandler } from '../rpc/host-handler';
import { FileSharingDecoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandler {
  constructor(
    private readonly rpcHandler: RpcHostHandler,
    private readonly readable: ReadableStream<ArrayBuffer>,
    private readonly decoder = new FileSharingDecoder(),
  ) {}

  subscribe(): Promise<void> {
    return subscribeToReadable(this.readable, this.onMessage.bind(this));
  }

  private async onMessage(chunk: ArrayBuffer): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.GetInformationRequest:
        await this.onGetInformationRequest();
        break;
      case PacketType.FileDownloadRequest:
        await this.onFileDownloadRequest(payload);
        break;
      default:
        throw new Error('Unknown packet type');
    }
  }

  private async onGetInformationRequest(): Promise<void> {
    await this.rpcHandler.onGetInformationRequest();
  }

  private async onFileDownloadRequest(payload: ArrayBuffer): Promise<void> {
    const request = this.decoder.decodeFileDownloadRequest(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onFileDownloadRequest(request);
  }
}
