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

    request.iceCandidate$.subscribe((candidate) => {
      void connection.addIceCandidate(candidate);
    });

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        void request.sendIceCandidate(event.candidate);
      }
    };

    await connection.setRemoteDescription(request.offer);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    await request.sendAnswer(answer);

    await new Promise<void>((resolve, reject) => {
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'connected') {
          resolve();
        }

        if (connection.iceConnectionState === 'failed') {
          reject(new Error('Ice connection failed'));
        }
      };
    });

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

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    const response = await signalingServer.sendRequest({
      toId,
      offer,
    });

    await connection.setRemoteDescription(await response.answer);

    response.iceCandidate$.subscribe((candidate) => {
      void connection.addIceCandidate(candidate);
    });

    connection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        void response.sendIceCandidate(candidate);
      }
    };

    await new Promise<void>((resolve, reject) => {
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'connected') {
          resolve();
        }

        if (connection.iceConnectionState === 'failed') {
          reject(new Error('Ice connection failed'));
        }
      };
    });

    return {
      peerId: toId,
      connection,
      offer,
    };
  };
}
