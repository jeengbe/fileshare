import { usingLocked } from './using';

export async function subscribeToReadable<T>(
  readable: ReadableStream<T>,
  onChunk: (chunk: T) => Promise<void>,
): Promise<void> {
  using reader = usingLocked(readable.getReader());

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    await onChunk(value);
  }
}
