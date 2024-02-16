import { ClientHandle } from '@/application/network/interface/client-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  ListFilesMetadataResponse,
} from '@/application/network/protocol';
import { writePacket } from '../util/packet';
import { ChannelManager } from './channel-manager';
import { FileSharingEncoder } from './codec';
import { FileDownloadResponsePacket } from './file-download-response-packet';
import { PacketType } from './packet-type';

export class WebRtcClientHandle implements ClientHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBuffer>,
    private readonly encoder: FileSharingEncoder,
    private readonly channelManager: ChannelManager,
  ) {}

  async sendListFilesMetadataResponse(
    response: ListFilesMetadataResponse,
  ): Promise<void> {
    const payload = this.encoder.encodeListFilesMetadataResponse(response);

    await writePacket(
      this.writable,
      PacketType.ListFilesMetadataResponse,
      payload,
    );
  }

  async sendFileUpdate(notification: FileUpdateNotification): Promise<void> {
    const payload = this.encoder.encodeFileUpdateNotification(notification);

    await writePacket(
      this.writable,
      PacketType.FileUpdateNotification,
      payload,
    );
  }

  async sendFileDownloadResponse(
    response: FileDownloadResponse,
  ): Promise<void> {
    let responsePacket: FileDownloadResponsePacket;

    if (response.stream) {
      const channelId = await this.channelManager.negotiateChannel();

      this.channelManager.streamToChannel(channelId, response.stream);

      responsePacket = {
        channelId,
      };
    } else {
      responsePacket = {
        channelId: null,
      };
    }

    const payload = this.encoder.encodeFileDownloadResponse(responsePacket);

    await writePacket(this.writable, PacketType.FileDownloadResponse, payload);
  }
}
