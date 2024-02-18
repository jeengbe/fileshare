import { usingLocked } from '@/infrastructure/util/using';
import { PortDataToSw } from '@/sw';

export async function pipeReadableStreamToMessagePort(
  stream: ReadableStream<Uint8Array>,
  port: MessagePort,
  signal: AbortSignal,
): Promise<void> {
  await using reader = usingLocked(stream.getReader());

  signal.onabort = () => {
    console.log('Signal Aborted');
    void reader.cancel();
  };

  void reader.closed.finally(() => {
    console.log('Reader Closed');
    signal.onabort = null;
  });

  console.log('Piping stream to port');
  try {
    while (true) {
      const { done, value } = await reader.read();
      // await new Promise((resolve) => setTimeout(resolve, 1));

      if (done) {
        port.postMessage({
          type: 'close',
        } satisfies PortDataToSw);

        break;
      }

      port.postMessage(
        {
          type: 'data',
          chunk: value,
        } satisfies PortDataToSw,
        [value.buffer],
      );
    }
  } catch (err) {
    console.log('Reader Error', err);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return;
    }

    throw err;
  }
}
