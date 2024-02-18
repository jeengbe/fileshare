import { SharedFileMetadata } from './file';

export type FileUpdateListener = (update: FileUpdate) => void;

export type FileUpdate = FileAddedUpdate | FileRemovedUpdate;

interface FileAddedUpdate {
  type: FileUpdateType.Added;
  file: SharedFileMetadata;
}

interface FileRemovedUpdate {
  type: FileUpdateType.Removed;
  fileId: string;
}

export enum FileUpdateType {
  Added,
  Removed,
}
