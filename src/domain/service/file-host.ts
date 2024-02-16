import { SharedFileMetadata } from '@/domain/model/file';
import { FileUpdateListener } from '@/domain/model/update';
import { Subscription } from 'rxjs';

export interface FileHost {
  listFilesMetadata(): Promise<SharedFileMetadata[]>;
  subscribeToFileUpdates(listener: FileUpdateListener): Subscription;
  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | null>;
}
