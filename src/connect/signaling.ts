import { WebRtcSignalingServer } from '@/web-rtc-signaling/application/signaling-server';
import { RpcSignalingService } from '@/web-rtc-signaling/infrastructure/rpc/signaling-service';
import { StreamPacketClientHandler } from '@/web-rtc-signaling/infrastructure/stream/client-handler';
import { StreamPacketServerHandle } from '@/web-rtc-signaling/infrastructure/stream/server-handle';

export async function createSignalingWebSocket(): Promise<WebSocket> {
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
