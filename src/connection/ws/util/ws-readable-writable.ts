export function wsToWritable(
  socket: WebSocket,
): WritableStream<ArrayBufferLike> {
  return new WritableStream({
    write(chunk) {
      socket.send(chunk);
    },
    close() {
      socket.close();
    },
  });
}
