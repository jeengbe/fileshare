/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { decodePacket } from '@/util/stream/packet';
import { subscribeToReadable } from '@/util/stream/read';
import { RpcClientHandler } from '../rpc/client-handler';
import { SignalingServiceDecoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketClientHandler {
  constructor(
    private readonly rpcHandler: RpcClientHandler,
    private readonly readable: ReadableStream<ArrayBufferLike>,
    private readonly decoder = new SignalingServiceDecoder(),
  ) {}

  subscribe(): Promise<void> {
    return subscribeToReadable(this.readable, this.onMessage.bind(this));
  }

  private async onMessage(chunk: ArrayBufferLike): Promise<void> {
    const { type, payload } = decodePacket(chunk);

    switch (type) {
      case PacketType.OfferEvent:
        await this.onOfferEvent(payload);
        break;
      case PacketType.AnswerEvent:
        await this.onAnswerEvent(payload);
        break;
      case PacketType.IceCandidateEvent:
        await this.onIceCandidateEvent(payload);
        break;
      case PacketType.GetInformationResponse:
        await this.onGetInformationResponse(payload);
        break;
      case PacketType.SendOfferResponse:
        await this.onSendOfferResponse();
        break;
      case PacketType.SendAnswerResponse:
        await this.onSendAnswerResponse();
        break;
      case PacketType.SendIceCandidateResponse:
        await this.onSendIceCandidateResponse();
        break;
      default:
        throw new Error('Unknown packet type');
    }
  }

  private async onOfferEvent(payload: ArrayBufferLike): Promise<void> {
    const event = this.decoder.decodeOfferEvent(new Uint8Array(payload));

    await this.rpcHandler.onOfferEvent(event);
  }

  private async onAnswerEvent(payload: ArrayBufferLike): Promise<void> {
    const event = this.decoder.decodeAnswerEvent(new Uint8Array(payload));

    await this.rpcHandler.onAnswerEvent(event);
  }

  private async onIceCandidateEvent(payload: ArrayBufferLike): Promise<void> {
    const event = this.decoder.decodeIceCandidateEvent(new Uint8Array(payload));

    await this.rpcHandler.onIceCandidateEvent(event);
  }

  private async onGetInformationResponse(
    payload: ArrayBufferLike,
  ): Promise<void> {
    const response = this.decoder.decodeGetInformationResponse(
      new Uint8Array(payload),
    );

    await this.rpcHandler.onGetInformationResponse(response);
  }

  private async onSendOfferResponse(): Promise<void> {
    await this.rpcHandler.onSendOfferResponse();
  }

  private async onSendAnswerResponse(): Promise<void> {
    await this.rpcHandler.onSendAnswerResponse();
  }

  private async onSendIceCandidateResponse(): Promise<void> {
    await this.rpcHandler.onSendIceCandidateResponse();
  }
}
