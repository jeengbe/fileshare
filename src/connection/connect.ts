import { useLater } from '@/util/use-later';
import { WebRtcSignalingServer } from '@/web-rtc-signaling/application/signaling-server';
import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { RpcSignalingService } from '@/web-rtc-signaling/infrastructure/rpc/signaling-service';
import { StreamPacketClientHandler } from '@/web-rtc-signaling/infrastructure/stream/client-handler';
import { StreamPacketServerHandle } from '@/web-rtc-signaling/infrastructure/stream/server-handle';
import { useCallback, useEffect, useState } from 'react';
import {
  establishConnectionIncoming,
  establishConnectionOutgoing,
} from './web-rtc/web-rtc';

export function useSignaling(): {
  info: PeerInfo;
  peers: ReadonlyMap<string, RTCPeerConnection>;
  connect: (peerId: string) => void;
} | null {
  const [peers, setPeers] = useState<ReadonlyMap<string, RTCPeerConnection>>(
    new Map(),
  );

  const signalingServer = useLater(connectToSignalingServer);

  useEffect(() => {
    if (signalingServer) {
      const subscription = signalingServer.incoming$.subscribe((incoming) => {
        const { peerId, rtcConnection } = establishConnectionIncoming(
          signalingServer,
          incoming,
        );

        setPeers((peers) => new Map(peers).set(peerId, rtcConnection));
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [signalingServer]);

  const connect = useCallback(
    (peerId: string) => {
      if (!signalingServer) return;

      const { rtcConnection } = establishConnectionOutgoing(
        signalingServer,
        peerId,
      );

      setPeers((peers) => new Map(peers).set(peerId, rtcConnection));
    },
    [signalingServer],
  );

  useEffect(() => {
    return () => {
      peers.forEach((rtcConnection) => {
        rtcConnection.close();
      });
    };
  }, [peers]);

  return signalingServer
    ? {
        info: signalingServer.info,
        peers,
        connect,
      }
    : null;
}

async function connectToSignalingServer(): Promise<WebRtcSignalingServer> {
  const ws = await createSignalingWebSocket();

  const signalingService = new RpcSignalingService(
    new StreamPacketServerHandle({
      write: ws.send.bind(ws),
    }),
  );

  const packetHandler = new StreamPacketClientHandler(signalingService);

  ws.onmessage = ({ data }) => packetHandler.onMessage(data as ArrayBufferLike);

  const info = await signalingService.getInfo();

  return new WebRtcSignalingServer(info, signalingService);
}

async function createSignalingWebSocket(): Promise<WebSocket> {
  const webSocket = new WebSocket('ws://localhost:8080');

  webSocket.binaryType = 'arraybuffer';

  let onOpen!: () => void;
  let onError!: (event: Event) => void;

  const promise = new Promise<void>((resolve, reject) => {
    onOpen = resolve;
    onError = reject;
  });

  webSocket.addEventListener('open', onOpen);
  webSocket.addEventListener('error', onError);

  try {
    await promise;
  } finally {
    webSocket.removeEventListener('open', onOpen);
    webSocket.removeEventListener('error', onError);
  }

  return webSocket;
}
