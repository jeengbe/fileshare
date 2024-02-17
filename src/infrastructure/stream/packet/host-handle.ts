import { RpcHostHandle } from '@/application/rpc/interface/host-handle';
import { FileDownloadRequest } from '@/application/rpc/protocol';
import { writePacket } from '../../util/packet';
import { FileSharingEncoder } from '../codec';
import { PacketType } from '../protocol';

export class StreamPacketHostHandle implements RpcHostHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBuffer>,
    private readonly encoder: FileSharingEncoder = new FileSharingEncoder(),
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
