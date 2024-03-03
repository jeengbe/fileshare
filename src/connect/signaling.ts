import { WebRtcSignalingServer } from '@/web-rtc-signaling/application/signaling-server';
import { RpcSignalingService } from '@/web-rtc-signaling/infrastructure/rpc/signaling-service';
import { StreamPacketClientHandler } from '@/web-rtc-signaling/infrastructure/stream/client-handler';
import { StreamPacketServerHandle } from '@/web-rtc-signaling/infrastructure/stream/server-handle';

export async function createSignalingWebSocket(): Promise<WebSocket> {
  const webSocket = new WebSocket('ws://localhost:8080');

  webSocket.binaryType = 'arraybuffer';

  let onOpen!: () => void;
  let onClose!: (event: CloseEvent) => void;

  const promise = new Promise<void>((resolve, reject) => {
    onOpen = resolve;
    onClose = (event: CloseEvent) => {
      reject(
        new Error('Failed to connect to signaling server', {
          cause: event.reason,
        }),
      );
    };
  });

  webSocket.addEventListener('open', onOpen);
  webSocket.addEventListener('close', onClose);

  try {
    await promise;
  } finally {
    webSocket.removeEventListener('open', onOpen);
    webSocket.removeEventListener('close', onClose);
  }

  return webSocket;
}

export async function connectToSignalingServer(
  ws: WebSocket,
): Promise<WebRtcSignalingServer> {
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
