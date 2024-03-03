import { usingLocked } from './using';

export function subscribeToReadable<T>(
  readable: ReadableStream<T>,
  onChunk: (chunk: T) => Promise<void>,
): [() => void, Promise<void>] {
  using reader = usingLocked(readable.getReader());

  return [() => reader.cancel(), _subscribeToReadable(reader, onChunk)];
}

async function _subscribeToReadable<T>(
  reader: ReadableStreamDefaultReader<T>,
  onChunk: (chunk: T) => Promise<void>,
): Promise<void> {
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    await onChunk(value);
  }
}
