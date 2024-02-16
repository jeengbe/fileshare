export function assert(
  condition: boolean,
  message?: string,
): asserts condition {
  if (!condition) {
    if (message) {
      throw new Error(`Assertion failed: ${message}`);
    }

    throw new Error('Assertion failed');
  }
}
