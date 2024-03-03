import { ChannelManager } from '@/connection/channel-manager';
import { writePacket } from '@/util/stream/packet';
import { Writer } from '@/util/writer';
import { RpcClientHandle } from '../rpc/client-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from '../rpc/protocol';
import { FileSharingEncoder } from './codec';
import { FileDownloadResponsePacket, PacketType } from './protocol';

export class StreamPacketClientHandle implements RpcClientHandle {
  constructor(
    private readonly writer: Writer<ArrayBufferLike>,
    private readonly channelManager: ChannelManager,
    private readonly encoder = new FileSharingEncoder(),
  ) {}

  sendGetInformationResponse(response: GetInformationResponse): void {
    const payload = this.encoder.encodeGetInformationResponse(response);

    this.writePacket(PacketType.GetInformationResponse, payload);
  }

  sendFileUpdate(notification: FileUpdateNotification): void {
    const payload = this.encoder.encodeFileUpdateNotification(notification);

    this.writePacket(PacketType.FileUpdateNotification, payload);
  }

  sendFileDownloadResponse(response: FileDownloadResponse): void {
    let responsePacket: FileDownloadResponsePacket;

    if (response.stream) {
      const channelId = this.channelManager.getFreeChannelId();

      void this.channelManager.getWritable(channelId).then(async (writable) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We don't modify it
        await response.stream!.pipeTo(writable);
      });

      responsePacket = {
        channelId,
      };
    } else {
      responsePacket = {
        channelId: null,
      };
    }

    const payload = this.encoder.encodeFileDownloadResponse(responsePacket);

    this.writePacket(PacketType.FileDownloadResponse, payload);
  }

  private writePacket(type: PacketType, payload: Uint8Array): void {
    writePacket(this.writer, type, payload);
  }
}
