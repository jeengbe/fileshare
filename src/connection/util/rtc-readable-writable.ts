import { assert } from '@/util/assert';

export function rtcToReadable(
  channel: RTCDataChannel,
): ReadableStream<ArrayBuffer> {
  assert(channel.readyState === 'open', 'Channel must be open');

  return new ReadableStream({
    start(controller) {
      channel.onmessage = (event) => {
        controller.enqueue(event.data as ArrayBuffer);
      };

      channel.onclose = () => {
        controller.close();
      };

      channel.onerror = (error) => {
        controller.error(error);
      };
    },
  });
}

export function rtcToWritable(
  channel: RTCDataChannel,
): WritableStream<ArrayBuffer> {
  assert(channel.readyState === 'open', 'Channel must be open');

  return new WritableStream({
    write: async (chunk) => {
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
