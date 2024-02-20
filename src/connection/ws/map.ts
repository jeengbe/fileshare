import { wsToReadable, wsToWritable } from './util/ws-readable-writable';

export function webSocketToReadableWritablePair(
  socket: WebSocket,
): ReadableWritablePair<ArrayBuffer, ArrayBuffer> {
  return {
    readable: wsToReadable(socket),
    writable: wsToWritable(socket),
  };
}
