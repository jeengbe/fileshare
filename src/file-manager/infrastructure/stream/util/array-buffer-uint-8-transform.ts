export class ArrayBufferToUint8ArrayTransformStream extends TransformStream<
  ArrayBufferLike,
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
