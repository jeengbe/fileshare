/* eslint-disable camelcase */
import {
  AnswerEvent as AnswerEventProto,
  GetInformationResponse as GetInformationResponseProto,
  IceCandidateEvent as IceCandidateEventProto,
  OfferEvent as OfferEventProto,
  RtcIceCandidate as RtcIceCandidateProto,
  RtcSessionDescriptionType as RtcSdpTypeProto,
  RtcSessionDescriptionInit as RtcSessionDescriptionInitProto,
  SendAnswerRequest as SendAnswerRequestProto,
  SendIceCandidateRequest as SendIceCandidateRequestProto,
  SendOfferRequest as SendOfferRequestProto,
} from '@/lib/proto/signaling/packets';
import {
  AnswerEvent,
  GetInformationResponse,
  IceCandidateEvent,
  OfferEvent,
  SendAnswerRequest,
  SendIceCandidateRequest,
  SendOfferRequest,
} from '../rpc/protocol';

export class SignalingServiceEncoder {
  encodeOfferEvent(event: OfferEvent): Uint8Array {
    return OfferEventProto.fromObject({
      peer_id: event.fromId,
      offer: encodeRtcSessionDescriptionInit(event.offer),
    }).serialize();
  }

  encodeAnswerEvent(event: AnswerEvent): Uint8Array {
    return AnswerEventProto.fromObject({
      peer_id: event.fromId,
      answer: encodeRtcSessionDescriptionInit(event.answer),
    }).serialize();
  }

  encodeIceCandidateEvent(event: IceCandidateEvent): Uint8Array {
    return IceCandidateEventProto.fromObject({
      peer_id: event.toId,
      candidate: encodeRtcIceCandidate(event.candidate),
    }).serialize();
  }

  encodeGetInformationResponse(response: GetInformationResponse): Uint8Array {
    return GetInformationResponseProto.fromObject({
      user_id: response.information.userId,
      rtc_configuration: {
        ice_servers: response.information.rtcConfig.iceServers?.flatMap(
          (server) => server.urls,
        ),
      },
    }).serialize();
  }

  encodeSendOfferRequest(request: SendOfferRequest): Uint8Array {
    return SendOfferRequestProto.fromObject({
      peer_id: request.toId,
      offer: encodeRtcSessionDescriptionInit(request.offer),
    }).serialize();
  }

  encodeSendAnswerRequest(request: SendAnswerRequest): Uint8Array {
    return SendAnswerRequestProto.fromObject({
      peer_id: request.toId,
      answer: encodeRtcSessionDescriptionInit(request.answer),
    }).serialize();
  }

  encodeSendIceCandidateRequest(request: SendIceCandidateRequest): Uint8Array {
    return SendIceCandidateRequestProto.fromObject({
      peer_id: request.toId,
      candidate: encodeRtcIceCandidate(request.candidate),
    }).serialize();
  }
}

export class SignalingServiceDecoder {
  decodeOfferEvent(data: Uint8Array): OfferEvent {
    const proto = OfferEventProto.deserialize(data);

    return {
      fromId: proto.peer_id,
      offer: decodeRtcSessionDescriptionInit(proto.offer),
    };
  }

  decodeAnswerEvent(data: Uint8Array): AnswerEvent {
    const proto = AnswerEventProto.deserialize(data);

    return {
      fromId: proto.peer_id,
      answer: decodeRtcSessionDescriptionInit(proto.answer),
    };
  }

  decodeIceCandidateEvent(data: Uint8Array): IceCandidateEvent {
    const proto = IceCandidateEventProto.deserialize(data);

    return {
      toId: proto.peer_id,
      candidate: decodeRtcIceCandidate(proto.candidate),
    };
  }

  decodeGetInformationResponse(data: Uint8Array): GetInformationResponse {
    const proto = GetInformationResponseProto.deserialize(data);

    return {
      information: {
        userId: proto.user_id,
        rtcConfig: {
          iceServers: [
            {
              urls: proto.rtc_configuration.ice_servers,
            },
          ],
        },
      },
    };
  }

  decodeSendOfferRequest(data: Uint8Array): SendOfferRequest {
    const proto = SendOfferRequestProto.deserialize(data);

    return {
      toId: proto.peer_id,
      offer: decodeRtcSessionDescriptionInit(proto.offer),
    };
  }

  decodeSendAnswerRequest(data: Uint8Array): SendAnswerRequest {
    const proto = SendAnswerRequestProto.deserialize(data);

    return {
      toId: proto.peer_id,
      answer: decodeRtcSessionDescriptionInit(proto.answer),
    };
  }

  decodeSendIceCandidateRequest(data: Uint8Array): SendIceCandidateRequest {
    const proto = SendIceCandidateRequestProto.deserialize(data);

    return {
      toId: proto.peer_id,
      candidate: decodeRtcIceCandidate(proto.candidate),
    };
  }
}

function encodeRtcSessionDescriptionInit(
  description: RTCSessionDescriptionInit,
): RtcSessionDescriptionInitProto {
  return RtcSessionDescriptionInitProto.fromObject({
    type: encodeRtcSessionDescriptionType(description.type),
    sdp: description.sdp,
  });
}

function encodeRtcSessionDescriptionType(type: RTCSdpType): RtcSdpTypeProto {
  switch (type) {
    case 'offer':
      return RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_OFFER;
    case 'answer':
      return RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_ANSWER;
    case 'pranswer':
      return RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_PRANSWER;
    case 'rollback':
      return RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_ROLLBACK;
  }
}

function encodeRtcIceCandidate(
  candidate: RTCIceCandidate,
): RtcIceCandidateProto {
  const json = candidate.toJSON();

  return RtcIceCandidateProto.fromObject({
    candidate: json.candidate,
    sdp_mid: json.sdpMid ?? undefined,
    sdp_m_line_index: json.sdpMLineIndex ?? undefined,
    username_fragment: json.usernameFragment ?? undefined,
  });
}

function decodeRtcSessionDescriptionInit(
  proto: RtcSessionDescriptionInitProto,
): RTCSessionDescriptionInit {
  return {
    type: decodeRtcSessionDescriptionType(proto.type),
    sdp: proto.sdp,
  };
}

function decodeRtcSessionDescriptionType(proto: RtcSdpTypeProto): RTCSdpType {
  switch (proto) {
    case RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_OFFER:
      return 'offer';
    case RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_ANSWER:
      return 'answer';
    case RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_PRANSWER:
      return 'pranswer';
    case RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_ROLLBACK:
      return 'rollback';
    case RtcSdpTypeProto.RTC_SESSION_DESCRIPTION_TYPE_UNKNOWN:
      throw new Error('Unknown RTCSessionDescriptionType');
  }
}

function decodeRtcIceCandidate(proto: RtcIceCandidateProto): RTCIceCandidate {
  return new RTCIceCandidate({
    candidate: proto.candidate,
    sdpMid: proto.sdp_mid,
    sdpMLineIndex: proto.sdp_m_line_index,
    usernameFragment: proto.username_fragment,
  });
}
