import { Writer } from '@/util/writer';

export function writePacket(
  writer: Writer<ArrayBufferLike>,
  type: number,
  payload: ArrayBufferLike,
): void {
  const header = new DataView(new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT));
  header.setUint8(0, type);

  const headerAndPayload = new Uint8Array(
    Uint8Array.BYTES_PER_ELEMENT + payload.byteLength,
  );
  headerAndPayload.set(new Int8Array(header.buffer), 0);
  headerAndPayload.set(new Int8Array(payload), header.byteLength);

  writer.write(headerAndPayload.buffer);
}

export function decodePacket(packet: ArrayBufferLike): {
  type: number;
  payload: ArrayBufferLike;
} {
  const view = new DataView(packet);
  const type = view.getUint8(0);
  const payload = packet.slice(Uint8Array.BYTES_PER_ELEMENT);

  return { type, payload };
}
