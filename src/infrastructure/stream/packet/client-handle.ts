import { RpcClientHandle } from '@/application/rpc/interface/client-handle';
import {
  FileDownloadResponse,
  FileUpdateNotification,
  ListFilesMetadataResponse,
} from '@/application/rpc/protocol';
import { writePacket } from '../../util/packet';
import { ChannelManager } from '../channel-manager';
import { FileSharingEncoder } from '../codec';
import { FileDownloadResponsePacket, PacketType } from '../protocol';

export class StreamPacketClientHandle implements RpcClientHandle {
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

  private channelId: number | null = null;
  private readable: ReadableStream<ArrayBuffer> | null = null;

  async sendFileDownloadResponse(
    response: FileDownloadResponse,
  ): Promise<void> {
    let responsePacket: FileDownloadResponsePacket;

    if (response.stream) {
      const channelId = this.channelManager.getNextChannelId();

      this.channelId = channelId;
      this.readable = response.stream;

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

  async startDownloadStream(): Promise<void> {
    if (this.channelId && this.readable) {
      await this.readable.pipeTo(
        this.channelManager.getWritable(this.channelId),
      );
    }
  }
}
