export function wsToReadable(
  socket: WebSocket,
): ReadableStream<ArrayBufferLike> {
  return new ReadableStream({
    start(controller) {
      socket.onmessage = (event) => {
        controller.enqueue(event.data as ArrayBufferLike);
      };

      socket.onclose = () => {
        controller.close();
      };

      socket.onerror = (error) => {
        controller.error(error);
      };
    },
    cancel() {
      socket.close();
    },
  });
}

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
