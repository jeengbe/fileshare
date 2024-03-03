import { assert } from '@/util/assert';

export function rtcToReadable(
  channel: RTCDataChannel,
): ReadableStream<ArrayBufferLike> {
  assert(channel.readyState === 'open', 'Channel must be open');

  return new ReadableStream({
    start(controller) {
      channel.onmessage = (event) => {
        controller.enqueue(event.data as ArrayBufferLike);
      };

      channel.onclose = () => {
        controller.close();
      };

      channel.onerror = (error) => {
        controller.error(error);
      };
    },
    cancel() {
      channel.close();
    },
  });
}

export function rtcToWritable(
  channel: RTCDataChannel,
): WritableStream<ArrayBufferLike> {
  assert(channel.readyState === 'open', 'Channel must be open');

  return new WritableStream({
    async write(chunk) {
      await waitForChannelReady();

      channel.send(chunk);
    },
    close() {
      channel.close();
    },
  });

  async function waitForChannelReady() {
    if (channel.bufferedAmount < channel.bufferedAmountLowThreshold) {
      return;
    }

    let onBufferedAmountLow!: () => void;
    let onError!: (event: Event) => void;

    const promise = new Promise<void>((resolve, reject) => {
      onBufferedAmountLow = resolve;
      onError = reject;
    });

    channel.addEventListener('bufferedamountlow', onBufferedAmountLow);
    channel.addEventListener('error', onError);

    try {
      await promise;
    } finally {
      channel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
      channel.removeEventListener('error', onError);
    }
  }
}
