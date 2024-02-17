import { usingLocked } from '@/infrastructure/util/using';
import { PortDataToSw } from '@/sw';

export async function pipeReadableStreamToMessagePort(
  stream: ReadableStream<Uint8Array>,
  port: MessagePort,
  signal: AbortSignal,
): Promise<void> {
  await using reader = usingLocked(stream.getReader());

  signal.addEventListener('abort', () => {
    void reader.cancel();
  });

  try {
    while (true) {
      const { done, value } = await reader.read();

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
    if (err instanceof DOMException && err.name === 'AbortError') {
      return;
    }

    throw err;
  }
}
