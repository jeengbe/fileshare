import { writePacket } from '@/util/stream/packet';
import { RpcHostHandle } from '../rpc/host-handle';
import { FileDownloadRequest } from '../rpc/protocol';
import { FileSharingEncoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandle implements RpcHostHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBufferLike>,
    private readonly encoder = new FileSharingEncoder(),
  ) {}

  async sendGetInformationRequest(): Promise<void> {
    const payload = new Uint8Array();

    await this.writePacket(PacketType.GetInformationRequest, payload);
  }

  async sendFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const payload = this.encoder.encodeFileDownloadRequest(request);

    await this.writePacket(PacketType.FileDownloadRequest, payload);
  }

  private async writePacket(
    type: PacketType,
    payload: Uint8Array,
  ): Promise<void> {
    await writePacket(this.writable, type, payload);
  }
}
