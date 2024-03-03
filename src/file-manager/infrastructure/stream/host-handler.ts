/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { decodePacket } from '@/util/stream/packet';
import { subscribeToReadable } from '@/util/stream/read';
import { Unsubscribable } from 'rxjs';
import { RpcHostHandler } from '../rpc/host-handler';
import { FileSharingDecoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandler {
  public readonly closePromise: Promise<void>;
  private closeResolve!: () => void;
  private closeReject!: (error: Error) => void;

  constructor(
    private readonly rpcHandler: RpcHostHandler,
    private readonly readable: ReadableStream<ArrayBufferLike>,
    private readonly decoder = new FileSharingDecoder(),
  ) {
    this.closePromise = new Promise((resolve, reject) => {
      this.closeResolve = resolve;
      this.closeReject = reject;
    });
  }

  subscribe(): Unsubscribable {
    subscribeToReadable(this.readable, this.onMessage.bind(this)).then(
      () => {
        this.closeResolve();
      },
      (error: Error) => {
        this.closeReject(error);
      },
    );

    return {
      unsubscribe: () => {
        void this.readable.cancel();
      },
    };
  }

  private async onMessage(chunk: ArrayBufferLike): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.GetInformationRequest:
        await this.onGetInformationRequest();
        break;
      case PacketType.FileDownloadRequest:
        await this.onFileDownloadRequest(payload);
        break;
      default:
        throw new Error('Unknown packet type');
    }
  }

  private async onGetInformationRequest(): Promise<void> {
    await this.rpcHandler.onGetInformationRequest();
  }

  private async onFileDownloadRequest(payload: ArrayBufferLike): Promise<void> {
    const request = this.decoder.decodeFileDownloadRequest(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onFileDownloadRequest(request);
  }
}
