import { RtcConnectionStep1 } from '@/connection/steps';
import {
  IncomingWebRtcConnectionRequest,
  WebRtcSignalingServer,
} from './signaling-server';

export function establishConnectionIncoming(
  rtcConfig: RTCConfiguration,
): (request: IncomingWebRtcConnectionRequest) => Promise<RtcConnectionStep1> {
  return async (request) => {
    const connection = new RTCPeerConnection(rtcConfig);

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
      peerId: request.peerId,
      connection,
    };
  };
}

export function establishConnectionOutgoing(
  signalingServer: WebRtcSignalingServer,
): (peerId: string) => Promise<RtcConnectionStep1> {
  return async (peerId) => {
    const connection = new RTCPeerConnection(signalingServer.rtcConfig);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    const response = await signalingServer.sendRequest({
      peerId,
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
      peerId,
      connection,
      offer,
    };
  };
}
