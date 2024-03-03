import {
  IncomingWebRtcConnection,
  WebRtcSignalingServer,
} from '@/web-rtc-signaling/application/signaling-server';
import { RawRtcConnection } from './steps';

export function establishConnectionIncoming(
  signalingServer: WebRtcSignalingServer,
): (request: IncomingWebRtcConnection) => Promise<RawRtcConnection> {
  return async (request) => {
    const connection = new RTCPeerConnection(signalingServer.info.rtcConfig);

    connection.addEventListener('connectionstatechange', () => {
      console.log('Connection state change', connection.connectionState);
    });
    connection.addEventListener('datachannel', (event) => {
      console.log('Data channel', event);
    });
    connection.addEventListener('icecandidate', (event) => {
      console.log('Ice candidate', event);
    });
    connection.addEventListener('icecandidateerror', (event) => {
      console.log('Ice candidate error', event);
    });
    connection.addEventListener('iceconnectionstatechange', () => {
      console.log('Ice connection state change', connection.iceConnectionState);
    });
    connection.addEventListener('icegatheringstatechange', () => {
      console.log('Ice gathering state change', connection.iceGatheringState);
    });
    connection.addEventListener('negotiationneeded', () => {
      console.log('Negotiation needed');
    });
    connection.addEventListener('signalingstatechange', () => {
      console.log('Signaling state change', connection.signalingState);
    });
    connection.addEventListener('track', (event) => {
      console.log('Track', event);
    });

    connection.onnegotiationneeded = async () => {
      request.iceCandidate$.subscribe((candidate) => {
        void connection.addIceCandidate(candidate);
      });

      connection.addEventListener('icecandidate', (event) => {
        console.log('Ice candidate', event);
        if (event.candidate) {
          void request.sendIceCandidate(event.candidate);
        }
      });

      await connection.setRemoteDescription(
        new RTCSessionDescription(request.offer),
      );
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      await request.sendAnswer(answer);
    };

    return {
      peerId: request.fromId,
      connection,
    };
  };
}

export function establishConnectionOutgoing(
  signalingServer: WebRtcSignalingServer,
): (fromId: string) => Promise<RawRtcConnection> {
  return async (toId) => {
    const connection = new RTCPeerConnection(signalingServer.info.rtcConfig);

    connection.addEventListener('connectionstatechange', () => {
      console.log('Connection state change', connection.connectionState);
    });
    connection.addEventListener('datachannel', (event) => {
      console.log('Data channel', event);
    });
    connection.addEventListener('icecandidate', (event) => {
      console.log('Ice candidate', event);
    });
    connection.addEventListener('icecandidateerror', (event) => {
      console.log('Ice candidate error', event);
    });
    connection.addEventListener('iceconnectionstatechange', () => {
      console.log('Ice connection state change', connection.iceConnectionState);
    });
    connection.addEventListener('icegatheringstatechange', () => {
      console.log('Ice gathering state change', connection.iceGatheringState);
    });
    connection.addEventListener('negotiationneeded', () => {
      console.log('Negotiation needed');
    });
    connection.addEventListener('signalingstatechange', () => {
      console.log('Signaling state change', connection.signalingState);
    });
    connection.addEventListener('track', (event) => {
      console.log('Track', event);
    });

    connection.onnegotiationneeded = async () => {
      const offer = await connection.createOffer();
      const response = await signalingServer.sendRequest({
        toId,
        offer,
      });

      // eslint-disable-next-line func-style
      const iceListener = (event: RTCPeerConnectionIceEvent) => {
        console.log('Ice candidate', event);
        if (event.candidate) {
          void response.sendIceCandidate(event.candidate);
        }
      };

      connection.addEventListener('icecandidate', iceListener);

      response.iceCandidate$.subscribe((candidate) => {
        void connection.addIceCandidate(candidate);
      });

      await connection.setLocalDescription(offer);

      await connection.setRemoteDescription(await response.answer);

      connection.removeEventListener('icecandidate', iceListener);
    };

    return {
      peerId: toId,
      connection,
    };
  };
}
