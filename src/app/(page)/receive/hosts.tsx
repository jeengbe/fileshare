'use client';

import { step1To2, step2To3, step3ToClient4 } from '@/connection/map';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { useLater } from '@/util/use-later';
import { establishConnectionIncoming } from '@/web-rtc/connect';
import { WebRtcSignalingServerConnector } from '@/web-rtc/connector';
import { WebRtcSignalingServer } from '@/web-rtc/signaling-server';
import { useEffect, useState } from 'react';
import { Subject, map, mergeMap } from 'rxjs';
import { ReceiveHost } from './host';

const connector: WebRtcSignalingServerConnector = {
  async connect() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return new WebRtcSignalingServer(
      'USER-ID',
      {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
      {
        offer$: new Subject<[peerId: string, RTCSessionDescriptionInit]>(),
        answer$: new Subject<[peerId: string, RTCSessionDescriptionInit]>(),
        iceCandidate$: new Subject<[peerId: string, RTCIceCandidate]>(),

        sendOffer: (...d) => Promise.resolve(console.log('Send Offer', d)),
        sendAnswer: (...d) => Promise.resolve(console.log('Send Answer', d)),
        sendIceCandidate: (...d) =>
          Promise.resolve(console.log('Send Candidate', d)),

        [Symbol.dispose]: () => {
          console.log('disconnect');
        },
      },
    );
  },
};

export const Receive = () => {
  const [hosts, setHosts] = useState<ReadonlyMap<string, FileHost>>(new Map());
  const signalingServer = useLater(
    () => connector.connect(),
    (c) => c[Symbol.dispose](),
  );

  useEffect(() => {
    if (signalingServer) {
      const subscription = signalingServer.request$
        .pipe(mergeMap(establishConnectionIncoming(signalingServer.rtcConfig)))
        .pipe(mergeMap(step1To2), map(step2To3), map(step3ToClient4))
        .subscribe(({ peerId, clientHandler, host }) => {
          setHosts((hosts) => new Map(hosts).set(peerId, host));

          void clientHandler.subscribe().then(() => {
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

  return (
    <main className='flex flex-col gap-2 items-center'>
      {signalingServer ? (
        <Idle id={signalingServer.userId} hosts={hosts} />
      ) : (
        <Connecting />
      )}
    </main>
  );
};

const Idle = ({
  id,
  hosts,
}: {
  id: string;
  hosts: ReadonlyMap<string, FileHost>;
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
      <ReceiveHost key={hostId} host={host} />
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
