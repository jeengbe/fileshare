import { Writer } from '@/util/writer';
import { writePacket } from '../../../util/stream/packet';
import {
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from '../rpc/protocol';
import { RpcServerHandle } from '../rpc/server-handle';
import { SignalingServiceEncoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketServerHandle implements RpcServerHandle {
  constructor(
    private readonly writer: Writer<ArrayBuffer>,
    private readonly encoder = new SignalingServiceEncoder(),
  ) {}

  sendSendOfferRequest(request: SendOfferRequest): void {
    const payload = this.encoder.encodeSendOfferRequest(request);

    this.writePacket(PacketType.SendOfferRequest, payload);
  }

  sendSendAnswerRequest(request: SendAnswerRequest): void {
    const payload = this.encoder.encodeSendAnswerRequest(request);

    this.writePacket(PacketType.SendAnswerRequest, payload);
  }

  sendSendIceCandidateRequest(request: SendIceCandidateRequest): void {
    const payload = this.encoder.encodeSendIceCandidateRequest(request);

    this.writePacket(PacketType.SendIceCandidateRequest, payload);
  }

  sendGetInformationRequest(): void {
    this.writePacket(PacketType.GetInformationRequest, new Uint8Array());
  }

  private writePacket(type: PacketType, payload: Uint8Array): void {
    writePacket(this.writer, type, payload);
  }
}
