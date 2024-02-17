import { RpcClientHandle } from '@/application/rpc/interface/client-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  GetInformationResponse,
} from '@/application/rpc/protocol';
import { writePacket } from '../../util/packet';
import { ChannelManager } from '../channel-manager';
import { FileSharingEncoder } from '../codec';
import { FileDownloadResponsePacket, PacketType } from '../protocol';

export class StreamPacketClientHandle implements RpcClientHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBuffer>,
    private readonly channelManager: ChannelManager,
    private readonly encoder: FileSharingEncoder = new FileSharingEncoder(),
  ) {}

  async sendGetInformationResponse(
    response: GetInformationResponse,
  ): Promise<void> {
    const payload = this.encoder.encodeListFilesMetadataResponse(response);

    await this.writePacket(PacketType.GetInformationResponse, payload);
  }

  async sendFileUpdate(notification: FileUpdateNotification): Promise<void> {
    const payload = this.encoder.encodeFileUpdateNotification(notification);

    await this.writePacket(PacketType.FileUpdateNotification, payload);
  }

  async sendFileDownloadResponse(
    response: FileDownloadResponse,
  ): Promise<void> {
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

    await this.writePacket(PacketType.FileDownloadResponse, payload);
  }

  private async writePacket(
    type: PacketType,
    payload: Uint8Array,
  ): Promise<void> {
    await writePacket(this.writable, type, payload);
  }
}
