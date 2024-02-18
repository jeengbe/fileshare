import { MessageDataToSw, PortDataFromSw } from '@/sw';
import { pipeReadableStreamToMessagePort } from '@/util/port';
import assert from 'assert';
import { useCallback, useEffect, useState } from 'react';

export type FileDownloader = (info: {
  fileId: string;
  filename: string;
  size: number;
  stream: ReadableStream<Uint8Array>;
}) => Promise<void>;

export function useDownload(): FileDownloader | null {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  useEffect(() => {
    void (async () => {
      const registration = await navigator.serviceWorker.ready;

      setRegistration(registration);
    })();
  }, []);

  const dl: FileDownloader = useCallback(
    async ({ fileId, filename, size, stream }) => {
      assert(registration);

      if (!registration.active) {
        throw new Error('Service worker not active');
      }

      console.log('Downloading file', { fileId, filename, size });

      const port = new MessageChannel();
      const { port1, port2 } = port;
      const abortPort = new MessageChannel();
      const { port1: abortPort1, port2: abortPort2 } = abortPort;

      registration.active.postMessage(
        {
          type: 'download',
          id: fileId,
          filename,
          size,
          port: port2,
          abortPort: abortPort2,
        } satisfies MessageDataToSw,
        [port2, abortPort2],
      );

      const controller = new AbortController();
      const { signal } = controller;

      location.href = `/download/${fileId}`;
      abortPort1.onmessage = (event) => {
        const data = event.data as PortDataFromSw;
        alert('ASD');

        switch (data.type) {
          case 'close':
            console.log('Download aborted');
            controller.abort();
            break;
        }
      };

      await pipeReadableStreamToMessagePort(stream, port1, signal);
    },
    [registration],
  );

  return registration ? dl : null;
}
