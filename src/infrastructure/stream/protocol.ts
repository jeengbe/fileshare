export enum PacketType {
  GetInformationRequest = 0,
  GetInformationResponse = 1,
  FileUpdateNotification = 2,
  FileDownloadRequest = 3,
  FileDownloadResponse = 4,
}

export interface FileDownloadResponsePacket {
  channelId: number | null;
}
