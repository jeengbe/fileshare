import { RpcHostHandler } from '@/application/rpc/interface/host-handler';
import { decodePacket } from '../../util/packet';
import { subscribeToReadable } from '../../util/read';
import { FileSharingDecoder } from '../codec';
import { PacketType } from '../protocol';

export class StreamPacketHostHandler {
  constructor(
    private readonly host: RpcHostHandler,
    private readonly readable: ReadableStream<ArrayBuffer>,
    private readonly decoder: FileSharingDecoder = new FileSharingDecoder(),
  ) {}

  async subscribe(): Promise<void> {
    await subscribeToReadable(this.readable, this.onMessage.bind(this));
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
    }
  }

  private async onGetInformationRequest(): Promise<void> {
    await this.host.onGetInformationRequest();
  }

  private async onFileDownloadRequest(payload: ArrayBuffer): Promise<void> {
    const request = this.decoder.decodeFileDownloadRequest(
      new Uint8Array(payload),
    );

    await this.host.onFileDownloadRequest(request);
  }
}
