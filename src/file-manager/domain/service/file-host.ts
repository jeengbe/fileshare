import { Subscription } from 'rxjs';
import { HostInformation } from '../model/host-information';
import { FileUpdateListener } from '../model/update';

export interface FileHost {
  getInformation(): Promise<HostInformation>;
  subscribeToFileUpdates(listener: FileUpdateListener): Subscription;
  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | null>;
}
