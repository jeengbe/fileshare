import { wsToReadable, wsToWritable } from './util/ws-readable-writable';

export function webSocketToReadableWritablePair(
  socket: WebSocket,
): ReadableWritablePair<ArrayBufferLike, ArrayBufferLike> {
  return {
    readable: wsToReadable(socket),
    writable: wsToWritable(socket),
  };
}
