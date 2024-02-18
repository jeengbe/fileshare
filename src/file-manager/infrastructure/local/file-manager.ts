import { SharedFile } from '@/file-manager/domain/model/file';
import { Subject } from 'rxjs';

export type FileActionListener = (action: FileAction) => void;

export class FileManager {
  private readonly files = new Map<string, File>();
  public readonly fileAction$ = new Subject<FileAction>();

  addFile(file: File): void {
    const id = crypto.randomUUID();

    this.files.set(id, file);

    this.fileAction$.next({
      type: FileActionType.Add,
      file: {
        id,
        file,
      },
    });
  }

  removeFile(id: string): void {
    this.files.delete(id);

    this.fileAction$.next({
      type: FileActionType.Remove,
      fileId: id,
    });
  }

  getSharedFiles(): SharedFile[] {
    return Array.from(this.files, ([id, file]) => ({
      id,
      file,
    }));
  }

  getFile(fileId: string): File | undefined {
    return this.files.get(fileId);
  }
}

export type FileAction = FileAddAction | FileRemoveAction;

export interface FileAddAction {
  type: FileActionType.Add;
  file: SharedFile;
}

export interface FileRemoveAction {
  type: FileActionType.Remove;
  fileId: string;
}

export enum FileActionType {
  Add,
  Remove,
}
