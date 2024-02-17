export enum PacketType {
  ListFilesMetadataRequest = 0,
  ListFilesMetadataResponse = 1,
  FileUpdateNotification = 2,
  FileDownloadRequest = 3,
  FileDownloadResponse = 4,
  FileDownloadResponseAck = 5,
}

export interface FileDownloadResponsePacket {
  channelId: number | null;
}
