import { RpcHostHandle } from '@/application/rpc/interface/host-handle';
import { FileDownloadRequest } from '@/application/rpc/protocol';
import { writePacket } from '../../util/packet';
import { FileSharingEncoder } from '../codec';
import { PacketType } from '../protocol';

export class StreamPacketHostHandle implements RpcHostHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBuffer>,
    private readonly encoder: FileSharingEncoder,
  ) {}

  async sendListFilesMetadataRequest(): Promise<void> {
    const payload = new Uint8Array();

    await writePacket(
      this.writable,
      PacketType.ListFilesMetadataRequest,
      payload,
    );
  }

  async sendFileDownloadRequest(request: FileDownloadRequest): Promise<void> {
    const payload = this.encoder.encodeFileDownloadRequest(request);

    await writePacket(this.writable, PacketType.FileDownloadRequest, payload);
  }
}
