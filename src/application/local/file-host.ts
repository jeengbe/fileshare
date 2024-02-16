import { SharedFile, SharedFileMetadata } from '@/domain/model/file';
import {
  FileUpdate,
  FileUpdateListener,
  FileUpdateType,
} from '@/domain/model/update';
import { FileHost } from '@/domain/service/file-host';
import { Observable, Subscription, map } from 'rxjs';
import { FileActionType, FileManager } from './file-manager';

export class LocalFileHost implements FileHost {
  private readonly fileUpdateObservable: Observable<FileUpdate>;

  constructor(private readonly fileManager: FileManager) {
    this.fileUpdateObservable = this.fileManager.fileActionSubject.pipe(
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

  async listFilesMetadata(): Promise<SharedFileMetadata[]> {
    return this.fileManager
      .getSharedFiles()
      .map((sharedFile) => getFileMetadata(sharedFile));
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
