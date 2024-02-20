import { writePacket } from '../../../util/stream/packet';
import { RpcHostHandle } from '../rpc/host-handle';
import {
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from '../rpc/protocol';
import { SignalingServiceEncoder } from './codec';
import { PacketType } from './protocol';

export class StreamPacketHostHandle implements RpcHostHandle {
  constructor(
    private readonly writable: WritableStream<ArrayBuffer>,
    private readonly encoder = new SignalingServiceEncoder(),
  ) {}

  sendSendOfferRequest(request: SendOfferRequest): Promise<void> {
    const payload = this.encoder.encodeSendOfferRequest(request);

    return this.writePacket(PacketType.SendOfferRequest, payload);
  }

  sendSendAnswerRequest(request: SendAnswerRequest): Promise<void> {
    const payload = this.encoder.encodeSendAnswerRequest(request);

    return this.writePacket(PacketType.SendAnswerRequest, payload);
  }

  sendSendIceCandidateRequest(request: SendIceCandidateRequest): Promise<void> {
    const payload = this.encoder.encodeSendIceCandidateRequest(request);

    return this.writePacket(PacketType.SendIceCandidateRequest, payload);
  }

  async sendGetInformationRequest(): Promise<void> {
    const payload = new Uint8Array();

    await this.writePacket(PacketType.GetInformationRequest, payload);
  }

  private async writePacket(
    type: PacketType,
    payload: Uint8Array,
  ): Promise<void> {
    await writePacket(this.writable, type, payload);
  }
}
