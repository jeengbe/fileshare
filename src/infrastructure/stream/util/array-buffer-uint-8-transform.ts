export class ArrayBufferToUint8ArrayTransformStream extends TransformStream<
  ArrayBuffer,
  Uint8Array
> {
  constructor() {
    super({
      transform(chunk, controller) {
        controller.enqueue(new Uint8Array(chunk));
      },
    });
  }
}
