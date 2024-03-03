import { useDownload } from '@/components/download';
import {
  createChannelManager,
  createMetaChannel,
} from '@/connection/web-rtc/map';
import { SharedFileMetadata } from '@/file-manager/domain/model/file';
import { HostInformation } from '@/file-manager/domain/model/host-information';
import { FileUpdateType } from '@/file-manager/domain/model/update';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { RpcFileHost } from '@/file-manager/infrastructure/rpc/file-host';
import { StreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { StreamPacketHostHandle } from '@/file-manager/infrastructure/stream/host-handle';
import { useLater } from '@/util/use-later';
import { useCallback, useEffect, useState } from 'react';

export const ReceiveHost = ({
  rtcConnection,
}: {
  rtcConnection: RTCPeerConnection;
}) => {
  const hostAndInfo = useLater(async () => {
    const metaChannel = await createMetaChannel(rtcConnection);
    const channelManager = createChannelManager(rtcConnection, metaChannel);

    const fileHost = new RpcFileHost(
      new StreamPacketHostHandle({
        write: metaChannel.send.bind(metaChannel),
      }),
    );

    const clientHandler = new StreamPacketClientHandler(
      fileHost,
      channelManager,
    );

    metaChannel.onmessage = ({ data }) =>
      clientHandler.onMessage(data as ArrayBufferLike);

    const info = await fileHost.getInformation();

    return { fileHost, info };
  });

  return hostAndInfo ? (
    <Host fileHost={hostAndInfo.fileHost} info={hostAndInfo.info} />
  ) : (
    <p>Connecting...</p>
  );
};

const Host = ({
  fileHost,
  info,
}: {
  fileHost: FileHost;
  info: HostInformation;
}) => {
  const [name] = useState<string>(info.name);
  const [files, setFiles] = useState<ReadonlyMap<string, SharedFileMetadata>>(
    new Map(info.files.map((file) => [file.id, file])),
  );
  const download = useDownload();

  useEffect(() => {
    let isMounted = true;

    const updateSubscription = fileHost.subscribeToFileUpdates((update) => {
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

    return () => {
      isMounted = false;
      updateSubscription.unsubscribe();
    };
  }, [fileHost]);

  const downloadFile = useCallback(
    async (fileId: string) => {
      const file = files.get(fileId);

      if (!file) {
        console.error(`File with id ${fileId} not found locally.`);
        return;
      }

      const stream = await fileHost.downloadFile(fileId);

      if (!stream) {
        console.error(`File with id ${fileId} not found on remote.`);
        return;
      }

      await download!({
        fileId,
        filename: file.name,
        size: file.size,
        stream,
      });
    },
    [download, files, fileHost],
  );

  return name ? (
    <section>
      <h2>{name}</h2>
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
  ) : (
    <p>Loading...</p>
  );
};
