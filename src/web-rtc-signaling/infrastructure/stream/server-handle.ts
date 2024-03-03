import { Writer } from '@/util/writer';
import { writePacket } from '../../../util/stream/packet';
import {
  GetInformationRequest,
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

  sendGetInformationRequest(request: GetInformationRequest): void {
    const payload = this.encoder.encodeGetInformationRequest(request);

    this.writePacket(PacketType.GetInformationRequest, payload);
  }

  private writePacket(type: PacketType, payload: Uint8Array): void {
    writePacket(this.writer, type, payload);
  }
}
