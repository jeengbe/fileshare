'use client';

import { useSignaling } from '@/connection/connect';
import { ReceiveHost } from './host';

export const Receive = () => {
  const s = useSignaling();

  return s ? (
    <Idle id={s.info.userId} peers={s.peers} connect={s.connect} />
  ) : (
    <Connecting />
  );
};

const Idle = ({
  id,
  peers,
  connect,
}: {
  id: string;
  peers: ReadonlyMap<string, RTCPeerConnection>;
  connect: (peerId: string) => void;
}) => (
  <>
    <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
      <h1 className='text-center text-2xl font-bold'>Receive a file</h1>
      <p className='text-center text-lg'>
        Share this ID with the person you want to receive a file from:
      </p>
      <p className='text-center text-lg font-bold'>{id}</p>

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
      <ReceiveHost key={peerId} rtcConnection={rtcConnection} />
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
