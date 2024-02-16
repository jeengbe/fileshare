export enum PacketType {
  ListFilesMetadataRequest = 0,
  ListFilesMetadataResponse = 1,
  FileUpdateNotification = 2,
  FileDownloadRequest = 3,
  FileDownloadResponse = 4,
}

export interface FileDownloadResponsePacket {
  channelId: string | null;
}
