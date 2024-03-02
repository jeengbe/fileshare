import { assert } from '@/util/assert';

export function rtcToReadable(
  channel: RTCDataChannel,
): ReadableStream<ArrayBufferLikeLike> {
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

    const oldOnBufferedAmountLow = channel.onbufferedamountlow;
    const oldOnError = channel.onerror;

    await new Promise((resolve, reject) => {
      channel.onbufferedamountlow = resolve;
      channel.onerror = reject;
    });

    channel.onbufferedamountlow = oldOnBufferedAmountLow;
    channel.onerror = oldOnError;
  }
}
