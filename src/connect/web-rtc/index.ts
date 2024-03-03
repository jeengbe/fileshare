import {
  IncomingWebRtcConnection,
  WebRtcSignalingServer,
} from '@/web-rtc-signaling/application/signaling-server';
import { RawRtcConnection } from './steps';

export function establishConnectionIncoming(
  signalingServer: WebRtcSignalingServer,
  incoming: IncomingWebRtcConnection,
): RawRtcConnection {
  const rtcConnection = new RTCPeerConnection(signalingServer.info.rtcConfig);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  rtcConnection.addEventListener('negotiationneeded', async () => {
    incoming.iceCandidate$.subscribe((candidate) => {
      void rtcConnection.addIceCandidate(candidate);
    });

    rtcConnection.addEventListener(
      'icecandidate',
      (event: RTCPeerConnectionIceEvent): void => {
        if (event.candidate) {
          incoming.sendIceCandidate(event.candidate);
        }
      },
    );

    await rtcConnection.setRemoteDescription(
      new RTCSessionDescription(incoming.offer),
    );
    const answer = await rtcConnection.createAnswer();
    await rtcConnection.setLocalDescription(answer);

    incoming.sendAnswer(answer);
  });

  return {
    peerId: incoming.fromId,
    rtcConnection,
  };
}

export function establishConnectionOutgoing(
  signalingServer: WebRtcSignalingServer,
  toId: string,
): RawRtcConnection {
  const rtcConnection = new RTCPeerConnection(signalingServer.info.rtcConfig);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  rtcConnection.addEventListener('negotiationneeded', async () => {
    const offer = await rtcConnection.createOffer();
    const outgoing = signalingServer.sendRequest({
      toId,
      offer,
    });

    rtcConnection.addEventListener(
      'icecandidate',
      (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          outgoing.sendIceCandidate(event.candidate);
        }
      },
    );

    outgoing.iceCandidate$.subscribe((candidate) => {
      void rtcConnection.addIceCandidate(candidate);
    });

    await rtcConnection.setLocalDescription(offer);

    await rtcConnection.setRemoteDescription(await outgoing.answer);
  });

  return {
    peerId: toId,
    rtcConnection,
  };
}
