'use client';

import {
  rawToWithMetaChannel,
  step3ToHost4,
  withMetaChannelToReadableWritableChannelManager,
} from '@/connection/web-rtc/map';
import { establishConnectionIncoming } from '@/connection/web-rtc/web-rtc';
import { wsToWritable } from '@/connection/ws/util/ws-readable-writable';
import { LocalFileHost } from '@/file-manager/infrastructure/local/file-host';
import { FileManager } from '@/file-manager/infrastructure/local/file-manager';
import { StreamPacketHostHandler } from '@/file-manager/infrastructure/stream/host-handler';
import { useLater } from '@/util/use-later';
import { WebRtcSignalingServer } from '@/web-rtc-signaling/application/signaling-server';
import { RpcSignalingService } from '@/web-rtc-signaling/infrastructure/rpc/signaling-service';
import { StreamPacketClientHandler as SignalingStreamPacketClientHandler } from '@/web-rtc-signaling/infrastructure/stream/client-handler';
import { StreamPacketHostHandle } from '@/web-rtc-signaling/infrastructure/stream/host-handle';
import { useEffect, useMemo, useState } from 'react';
import { map, mergeMap } from 'rxjs';

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

export default function Page() {
  const fileManager = useMemo(() => new FileManager(), []);
  const fileHost = useMemo(
    () => new LocalFileHost('ado', fileManager),
    [fileManager],
  );

  const [clients, setClients] = useState<
    ReadonlyMap<string, [packetHandler: StreamPacketHostHandler]>
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
          map(step3ToHost4(fileHost)),
        )
        .subscribe(({ peerId, hostHandler }) => {
          setClients((clients) => new Map(clients).set(peerId, [hostHandler]));

          void hostHandler.closePromise.then(() => {
            setClients((clients) => {
              const newHosts = new Map(clients);
              newHosts.delete(peerId);
              return newHosts;
            });
          });
        });

      return () => subscription.unsubscribe();
    }
  }, [signalingServer, fileHost]);

  return (
    <>
      ID: {signalingServer?.info.userId}
      {Array.from(clients).map(([peerId]) => (
        <div key={peerId}>
          <h1>{peerId}</h1>
        </div>
      ))}
      <input
        type='file'
        onChange={({ target }) => {
          const file = target.files?.[0];
          if (file) {
            fileManager.addFile(file);
          }
        }}
      />
    </>
  );
}
