'use client';

// @ts-expect-error -- Polyfill
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error -- Polyfill
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export default function Page() {
  return <></>;
}
