import { assert } from '@/util/assert';

export class RtcReadableWritable
  implements ReadableWritablePair<ArrayBuffer, ArrayBuffer>
{
  public readonly readable: ReadableStream<ArrayBuffer>;
  public readonly writable: WritableStream<ArrayBuffer>;

  constructor(private readonly channel: RTCDataChannel) {
    assert(channel.readyState === 'open', 'Channel must be open');

    this.readable = new ReadableStream({
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

    this.writable = new WritableStream({
      write: async (chunk) => {
        await this.waitForChannelReady();

        channel.send(chunk);
      },
      close() {
        channel.close();
      },
    });
  }

  private async waitForChannelReady() {
    if (this.channel.bufferedAmount < this.channel.bufferedAmountLowThreshold) {
      return;
    }

    await new Promise((resolve) => {
      this.channel.onbufferedamountlow = resolve;
    });

    this.channel.onbufferedamountlow = null;
  }
}
