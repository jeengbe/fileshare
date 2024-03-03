import {
  connectToSignalingServer,
  createSignalingWebSocket,
} from '@/connect/signaling';
import {
  establishConnectionIncoming,
  establishConnectionOutgoing,
} from '@/connect/web-rtc';
import { RawRtcConnection } from '@/connect/web-rtc/steps';
import { useLater } from '@/util/use-later';
import { PeerInfo } from '@/web-rtc-signaling/domain/model/info';
import { useCallback, useEffect, useState } from 'react';

export interface SignalingConnection {
  info: PeerInfo;
  peers: ReadonlyMap<string, RTCPeerConnection>;
  connect: (peerId: string) => void;
}

export function useSignaling(): SignalingConnection | null {
  const [peers, setPeers] = useState<ReadonlyMap<string, RTCPeerConnection>>(
    new Map(),
  );

  const signalingServer = useLater(() =>
    createSignalingWebSocket().then(connectToSignalingServer),
  );

  const addPeer = useCallback(({ peerId, rtcConnection }: RawRtcConnection) => {
    let mounted = true;

    setPeers((peers) => new Map(peers).set(peerId, rtcConnection));

    function onConnectionStateChange() {
      if (!mounted) return;

      if (
        rtcConnection.connectionState === 'disconnected' ||
        rtcConnection.connectionState === 'closed'
      ) {
        setPeers((peers) => {
          const newPeers = new Map(peers);
          newPeers.delete(peerId);
          return newPeers;
        });
      }
    }

    rtcConnection.addEventListener(
      'connectionstatechange',
      onConnectionStateChange,
    );

    return () => {
      mounted = false;

      rtcConnection.removeEventListener(
        'connectionstatechange',
        onConnectionStateChange,
      );
    };
  }, []);

  useEffect(() => {
    if (signalingServer) {
      const subscription = signalingServer.incoming$.subscribe((incoming) => {
        const rawConnection = establishConnectionIncoming(
          signalingServer,
          incoming,
        );

        return addPeer(rawConnection);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [signalingServer]);

  const connect = useCallback(
    (peerId: string) => {
      if (!signalingServer) return;

      const rawConnection = establishConnectionOutgoing(
        signalingServer,
        peerId,
      );

      return addPeer(rawConnection);
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
