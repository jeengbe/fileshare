/* eslint-disable camelcase */
import { SharedFileMetadata } from '@/file-manager/domain/model/file';
import { FileUpdateType } from '@/file-manager/domain/model/update';
import {
  FileDownloadRequest as FileDownloadRequestProto,
  FileDownloadResponse as FileDownloadResponseProto,
  FileUpdate as FileUpdateProto,
  GetInformationResponse as GetInformationResponseProto,
  SharedFileMetadata as SharedFileMetadataProto,
} from '@/lib/proto/p2p/packets';
import {
  FileDownloadRequest,
  FileUpdateNotification,
  GetInformationResponse,
} from '../rpc/protocol';
import { FileDownloadResponsePacket } from './protocol';

export class FileSharingEncoder {
  encodeSharedFileMetadata(metadata: SharedFileMetadata): Uint8Array {
    return SharedFileMetadataProto.fromObject(metadata).serialize();
  }

  encodeGetInformationResponse(response: GetInformationResponse): Uint8Array {
    return GetInformationResponseProto.fromObject({
      name: response.information.name,
      files: response.information.files.map((item) =>
        SharedFileMetadataProto.fromObject(item),
      ),
    }).serialize();
  }

  encodeFileUpdateNotification(
    notification: FileUpdateNotification,
  ): Uint8Array {
    switch (notification.update.type) {
      case FileUpdateType.Added:
        return FileUpdateProto.fromObject({
          file_added: FileUpdateProto.FileAdded.fromObject({
            file: SharedFileMetadataProto.fromObject(notification.update.file),
          }),
        }).serialize();

      case FileUpdateType.Removed:
        return FileUpdateProto.fromObject({
          file_removed: FileUpdateProto.FileRemoved.fromObject({
            fileId: notification.update.fileId,
          }),
        }).serialize();
    }
  }

  encodeFileDownloadRequest(request: FileDownloadRequest): Uint8Array {
    return FileDownloadRequestProto.fromObject(request).serialize();
  }

  encodeFileDownloadResponse(response: FileDownloadResponsePacket): Uint8Array {
    return FileDownloadResponseProto.fromObject({
      channelId: response.channelId ?? undefined,
    }).serialize();
  }
}

export class FileSharingDecoder {
  decodeSharedFileMetadata(data: Uint8Array): SharedFileMetadata {
    const proto = SharedFileMetadataProto.deserialize(data);

    return {
      id: proto.id,
      name: proto.name,
      size: proto.size,
    };
  }

  decodeGetInformationResponse(data: Uint8Array): GetInformationResponse {
    const proto = GetInformationResponseProto.deserialize(data);

    return {
      information: {
        name: proto.name,
        files: proto.files.map((item) => ({
          id: item.id,
          name: item.name,
          size: item.size,
        })),
      },
    };
  }

  decodeFileUpdateNotification(data: Uint8Array): FileUpdateNotification {
    const proto = FileUpdateProto.deserialize(data);

    if (proto.has_file_added) {
      return {
        update: {
          type: FileUpdateType.Added,
          file: {
            id: proto.file_added.file.id,
            name: proto.file_added.file.name,
            size: proto.file_added.file.size,
          },
        },
      };
    } else if (proto.has_file_removed) {
      return {
        update: {
          type: FileUpdateType.Removed,
          fileId: proto.file_removed.fileId,
        },
      };
    }

    throw new Error('Invalid FileUpdateNotification');
  }

  decodeFileDownloadRequest(data: Uint8Array): FileDownloadRequest {
    const proto = FileDownloadRequestProto.deserialize(data);

    return {
      fileId: proto.fileId,
    };
  }

  decodeFileDownloadResponse(data: Uint8Array): FileDownloadResponsePacket {
    const proto = FileDownloadResponseProto.deserialize(data);

    return {
      channelId: proto.channelId,
    };
  }
}
