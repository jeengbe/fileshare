import { HostHandle } from '@/application/network/interface/host-handle';
import { FileDownloadRequest } from '@/application/network/protocol';
import { writePacket } from '../util/packet';
import { FileSharingEncoder } from './codec';
import { PacketType } from './packet-type';

export class WebRtcHostHandle implements HostHandle {
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
