'use client';

import {
  rawToWithMetaChannel,
  step3ToClient4,
  withMetaChannelToReadableWritableChannelManager,
} from '@/connection/web-rtc/map';
import {
  establishConnectionIncoming,
  establishConnectionOutgoing,
} from '@/connection/web-rtc/web-rtc';
import { wsToWritable } from '@/connection/ws/util/ws-readable-writable';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { StreamPacketClientHandler as FileStreamPacketClientHandler } from '@/file-manager/infrastructure/stream/client-handler';
import { useLater } from '@/util/use-later';
import { WebRtcSignalingServer } from '@/web-rtc-signaling/application/signaling-server';
import { RpcSignalingService } from '@/web-rtc-signaling/infrastructure/rpc/signaling-service';
import { StreamPacketClientHandler as SignalingStreamPacketClientHandler } from '@/web-rtc-signaling/infrastructure/stream/client-handler';
import { StreamPacketHostHandle } from '@/web-rtc-signaling/infrastructure/stream/host-handle';
import { useCallback, useEffect, useState } from 'react';
import { map, mergeMap } from 'rxjs';
import { ReceiveHost } from './host';

async function createSignalingWebSocket(): Promise<WebSocket> {
  const webSocket = new WebSocket('ws://localhost:8080');

  webSocket.binaryType = 'arraybuffer';

  await new Promise((resolve, reject) => {
    webSocket.onopen = resolve;
    webSocket.onerror = reject;
  });
  webSocket.onopen = null;
  webSocket.onerror = null;

  return webSocket;
}

export const Receive = () => {
  const [hosts, setHosts] = useState<
    ReadonlyMap<
      string,
      [host: FileHost, packetHandler: FileStreamPacketClientHandler]
    >
  >(new Map());

  const signalingServer = useLater(() =>
    createSignalingWebSocket().then(async (ws) => {
      const writable = wsToWritable(ws);

      const hostHandle = new StreamPacketHostHandle(writable);
      const signalingService = new RpcSignalingService(hostHandle);
      const packetHandler = new SignalingStreamPacketClientHandler(
        signalingService,
      );

      ws.onmessage = ({ data }) =>
        packetHandler.onMessage(data as ArrayBufferLike);

      const info = await signalingService.getInfo();

      return new WebRtcSignalingServer(info, signalingService);
    }),
  );

  useEffect(() => {
    if (signalingServer) {
      const subscription = signalingServer.incoming$
        .pipe(mergeMap(establishConnectionIncoming(signalingServer)))
        .pipe(
          mergeMap(rawToWithMetaChannel),
          map(withMetaChannelToReadableWritableChannelManager),
          map(step3ToClient4),
        )
        .subscribe(({ peerId, clientHandler, host }) => {
          setHosts((hosts) =>
            new Map(hosts).set(peerId, [host, clientHandler]),
          );

          void clientHandler.closePromise.then(() => {
            setHosts((hosts) => {
              const newHosts = new Map(hosts);
              newHosts.delete(peerId);
              return newHosts;
            });
          });
        });

      return () => subscription.unsubscribe();
    }
  }, [signalingServer]);

  const connect = useCallback(
    async (peerId: string) => {
      if (!signalingServer) return;

      const connection =
        await establishConnectionOutgoing(signalingServer)(peerId);

      const { clientHandler, host } = step3ToClient4(
        withMetaChannelToReadableWritableChannelManager(
          await rawToWithMetaChannel(connection),
        ),
      );

      setHosts((hosts) => new Map(hosts).set(peerId, [host, clientHandler]));

      void clientHandler.closePromise.then(() => {
        setHosts((hosts) => {
          const newHosts = new Map(hosts);
          newHosts.delete(peerId);
          return newHosts;
        });
      });
    },
    [signalingServer],
  );

  return (
    <main className='flex flex-col gap-2 items-center'>
      {signalingServer ? (
        <Idle
          id={signalingServer.info.userId}
          hosts={hosts}
          connect={connect}
        />
      ) : (
        <Connecting />
      )}
    </main>
  );
};

const Idle = ({
  id,
  hosts,
  connect,
}: {
  id: string;
  hosts: ReadonlyMap<
    string,
    [host: FileHost, packetHandler: FileStreamPacketClientHandler]
  >;
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

    {Array.from(hosts, ([hostId, [host, packetHandler]]) => (
      <ReceiveHost key={hostId} host={host} packetHandler={packetHandler} />
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
