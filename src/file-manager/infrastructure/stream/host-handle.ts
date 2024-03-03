import { writePacket } from '@/util/stream/packet';
import { Writer } from '@/util/writer';
import { RpcHostHandle } from '../rpc/host-handle';
import { FileDownloadRequest, GetInformationRequest } from '../rpc/protocol';
import { FileSharingEncoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandle implements RpcHostHandle {
  constructor(
    private readonly writer: Writer<ArrayBufferLike>,
    private readonly encoder = new FileSharingEncoder(),
  ) {}

  sendGetInformationRequest(request: GetInformationRequest): void {
    const payload = this.encoder.encodeGetInformationRequest(request);

    this.writePacket(PacketType.GetInformationRequest, payload);
  }

  sendFileDownloadRequest(request: FileDownloadRequest): void {
    const payload = this.encoder.encodeFileDownloadRequest(request);

    this.writePacket(PacketType.FileDownloadRequest, payload);
  }

  private writePacket(type: PacketType, payload: Uint8Array): void {
    writePacket(this.writer, type, payload);
  }
}
