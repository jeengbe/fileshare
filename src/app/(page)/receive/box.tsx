'use client';

import { FileHost } from '@/domain/service/file-host';
import { HostManager } from '@/infrastructure/web-rtc/signaling';
import { MessageDataToSw, PortDataFromSw } from '@/sw';
import { pipeReadableStreamToMessagePort } from '@/util/port';
import { useCallback, useEffect, useState } from 'react';
import { ReceiveHost } from './host';

enum ReceiveState {
  Idle,
  ConnectingToSignaling,
}

export type FileDownloader = (info: {
  fileId: string;
  filename: string;
  size: number;
  stream: ReadableStream<Uint8Array>;
}) => Promise<void>;

export const Receive = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  useEffect(() => {
    void (async () => {
      const registration = await navigator.serviceWorker.ready;

      setRegistration(registration);
    })();
  }, []);

  if (!registration) {
    return (
      <>
        <h1>Loading Service Worker...</h1>
      </>
    );
  }

  return <ReceiveBoxes registration={registration} />;
};

const ReceiveBoxes = ({
  registration,
}: {
  registration: ServiceWorkerRegistration;
}) => {
  const [state, setState] = useState(ReceiveState.ConnectingToSignaling);
  const [id, setId] = useState('');
  const [hosts, setHosts] = useState<ReadonlyMap<string, FileHost>>(new Map());

  useEffect(() => {
    void (async () => {
      const hostManager = new HostManager();

      const id = await hostManager.connect();

      setState(ReceiveState.Idle);
      setId(id);

      hostManager.onNewHost((hostId, host) =>
        setHosts((hosts) => new Map(hosts).set(hostId, host)),
      );
    })();
  }, []);

  const download: FileDownloader = useCallback(
    async ({ fileId, filename, size, stream }) => {
      if (!registration.active) {
        throw new Error('Service worker not active');
      }

      const port = new MessageChannel();
      const { port1, port2 } = port;

      registration.active.postMessage(
        {
          type: 'download',
          id: fileId,
          filename,
          size,
          port: port2,
        } satisfies MessageDataToSw,
        [port2],
      );

      const controller = new AbortController();
      const { signal } = controller;

      port1.onmessage = (event) => {
        const data = event.data as PortDataFromSw;

        switch (data.type) {
          case 'close':
            console.log('Download aborted');
            controller.abort();
            break;
        }
      };

      location.href = `/download/${fileId}`;

      await new Promise<void>((resolve) => setTimeout(resolve, 5000));

      await pipeReadableStreamToMessagePort(stream, port1, signal);
    },
    [registration.active],
  );

  return (
    <main className='flex flex-col gap-2 items-center'>
      {
        {
          [ReceiveState.Idle]: (
            <Idle id={id} hosts={hosts} download={download} />
          ),
          [ReceiveState.ConnectingToSignaling]: <Connecting />,
        }[state]
      }
    </main>
  );
};

const Idle = ({
  id,
  hosts,
  download,
}: {
  id: string;
  hosts: ReadonlyMap<string, FileHost>;
  download: FileDownloader;
}) => (
  <>
    <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
      <h1 className='text-center text-2xl font-bold'>Receive a file</h1>
      <p className='text-center text-lg'>
        Share this ID with the person you want to receive a file from:
      </p>
      <p className='text-center text-lg font-bold'>{id}</p>
    </section>
    {Array.from(hosts, ([hostId, host]) => (
      <ReceiveHost key={hostId} host={host} download={download} />
    ))}
  </>
);

const Connecting = () => (
  <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
    <h1 className='text-center text-2xl font-bold'>
      Connecting to signaling server...
    </h1>
  </section>
);
