'use client';

import { LocalFileHost } from '@/file-manager/infrastructure/local/file-host';
import { FileManager } from '@/file-manager/infrastructure/local/file-manager';
import { SignalingConnection, useSignaling } from '@/hooks/use-signaling';
import { useMemo } from 'react';
import { SendClient } from './client';

export const Send = () => {
  const signalingConnection = useSignaling();

  return signalingConnection ? (
    <Idle signalingConnection={signalingConnection} />
  ) : (
    <Connecting />
  );
};

const Idle = ({
  signalingConnection: {
    connect,
    info: { userId },
    peers,
  },
}: {
  signalingConnection: SignalingConnection;
}) => {
  const fileManager = useMemo(() => new FileManager(), []);
  const fileHost = useMemo(
    () => new LocalFileHost('ado', fileManager),
    [fileManager],
  );

  return (
    <>
      <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
        <h1 className='text-center text-2xl font-bold'>Send a file</h1>
        <p className='text-center text-lg'>
          Share this ID with the person you want to send a file to:
        </p>
        <p className='text-center text-lg font-bold'>{userId}</p>

        <input
          type='file'
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];

            if (file) {
              fileManager.addFile(file);
            }
          }}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const peerId = (
              (e.target as HTMLFormElement).peerId as HTMLInputElement
            ).value;

            if (peerId) {
              connect(peerId);
            }
          }}
        >
          <input type='text' placeholder='Enter peer ID' id='peerId' />
          <button>Connect to peer</button>
        </form>
      </section>

      {Array.from(peers, ([peerId, rtcConnection]) => (
        <SendClient
          key={peerId}
          peerId={peerId}
          rtcConnection={rtcConnection}
          fileHost={fileHost}
        />
      ))}
    </>
  );
};

const Connecting = () => (
  <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
    <h1 className='text-center text-2xl font-bold'>
      Connecting to signaling server...
    </h1>
  </section>
);
