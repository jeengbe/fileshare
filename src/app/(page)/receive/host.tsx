import { SharedFileMetadata } from '@/domain/model/file';
import { FileUpdateType } from '@/domain/model/update';
import { FileHost } from '@/domain/service/file-host';
import { useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { FileDownloader } from './box';

export const ReceiveHost = ({
  hostId,
  host,
  download,
}: {
  hostId: string;
  host: FileHost;
  download: FileDownloader;
}) => {
  const [files, setFiles] = useState<ReadonlyMap<string, SharedFileMetadata>>(
    new Map(),
  );

  useEffect(() => {
    let isMounted = true;
    let updateSubscription: Subscription | undefined;

    void host.listFilesMetadata().then((files) => {
      if (!isMounted) return;

      setFiles(new Map(files.map((file) => [file.id, file])));

      updateSubscription = host.subscribeToFileUpdates((update) => {
        if (!isMounted) return;

        switch (update.type) {
          case FileUpdateType.Added:
            setFiles((currentFiles) =>
              new Map(currentFiles).set(update.file.id, update.file),
            );
            break;

          case FileUpdateType.Removed:
            setFiles((currentFiles) => {
              const newFiles = new Map(currentFiles);
              newFiles.delete(update.fileId);
              return newFiles;
            });
            break;
        }
      });
    });

    return () => {
      isMounted = false;
      updateSubscription?.unsubscribe();
    };
  }, [host]);

  const downloadFile = useCallback(
    async (fileId: string) => {
      const file = files.get(fileId);

      if (!file) {
        console.error(`File with id ${fileId} not found locally.`);
        return;
      }

      const stream = await host.downloadFile(fileId);

      if (!stream) {
        console.error(`File with id ${fileId} not found on remote.`);
        return;
      }

      await download({
        fileId,
        filename: file.name,
        size: file.size,
        stream,
      });
    },
    [download, files, host],
  );

  return (
    <section>
      <h2>{hostId}</h2>
      <ul>
        {[...files.values()].map((file) => (
          <li key={file.id}>
            <button onClick={() => void downloadFile(file.id)}>
              {file.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
