import {
  SharedFile,
  SharedFileMetadata,
} from '@/file-manager/domain/model/file';
import { HostInformation } from '@/file-manager/domain/model/host-information';
import {
  FileUpdate,
  FileUpdateListener,
  FileUpdateType,
} from '@/file-manager/domain/model/update';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { Observable, Subscription, map } from 'rxjs';
import { FileActionType, FileManager } from './file-manager';

export class LocalFileHost implements FileHost {
  private readonly fileUpdateObservable: Observable<FileUpdate>;

  constructor(
    private readonly name: string,
    private readonly fileManager: FileManager,
  ) {
    this.fileUpdateObservable = this.fileManager.fileAction$.pipe(
      map((action) => {
        switch (action.type) {
          case FileActionType.Add:
            return {
              type: FileUpdateType.Added,
              file: getFileMetadata(action.file),
            };

          case FileActionType.Remove:
            return {
              type: FileUpdateType.Removed,
              fileId: action.fileId,
            };
        }
      }),
    );
  }

  async getInformation(): Promise<HostInformation> {
    const files = this.fileManager
      .getSharedFiles()
      .map((sharedFile) => getFileMetadata(sharedFile));

    return {
      name: this.name,
      files,
    };
  }

  subscribeToFileUpdates(listener: FileUpdateListener): Subscription {
    return this.fileUpdateObservable.subscribe(listener);
  }

  async downloadFile(
    fileId: string,
  ): Promise<ReadableStream<Uint8Array> | null> {
    const file = this.fileManager.getFile(fileId);

    if (!file) {
      return null;
    }

    return file.stream();
  }
}

function getFileMetadata(sharedFile: SharedFile): SharedFileMetadata {
  return {
    id: sharedFile.id,
    name: sharedFile.file.name,
    size: sharedFile.file.size,
  };
}
