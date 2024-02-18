'use client';

import { HostEventType } from '@/file-manager/application/rpc/interface/host-manager';
import { FileHost } from '@/file-manager/domain/service/file-host';
import { StreamHostManager } from '@/file-manager/infrastructure/stream/host-manager';
import { useEffect, useState } from 'react';
import { ReceiveHost } from './host';

enum ReceiveState {
  Idle,
  ConnectingToSignaling,
}

export const Receive = () => {
  const [state, setState] = useState(ReceiveState.ConnectingToSignaling);
  const [id, setId] = useState('');
  const [hosts, setHosts] = useState<ReadonlyMap<string, FileHost>>(new Map());

  useEffect(() => {
    void (async () => {
      const hostManager = new StreamHostManager();

      const { id } = await hostManager.connect();

      setState(ReceiveState.Idle);
      setId(id);

      hostManager.hostEvent$.subscribe((event) => {
        switch (event.type) {
          case HostEventType.Added:
            setHosts((hosts) => new Map(hosts).set(event.hostId, event.host));
            break;
          case HostEventType.Removed:
            setHosts((hosts) => {
              const newHosts = new Map(hosts);
              newHosts.delete(event.hostId);
              return newHosts;
            });
            break;
        }
      });
    });
  }, []);

  return (
    <main className='flex flex-col gap-2 items-center'>
      {
        {
          [ReceiveState.Idle]: <Idle id={id} hosts={hosts} />,
          [ReceiveState.ConnectingToSignaling]: <Connecting />,
        }[state]
      }
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
