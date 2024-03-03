'use client';

export function DisposePolyfill() {
  // @ts-expect-error -- Polyfill
  Symbol.dispose ??= Symbol('Symbol.dispose');
  // @ts-expect-error -- Polyfill
  Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

  return null;
}
