'use client';

import { useCallback } from 'react';

// @ts-expect-error -- Polyfill
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error -- Polyfill
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export default function Page() {
  const send = useCallback(async () => {}, []);
  const receive = useCallback(async () => {}, []);

  return (
    <main>
      <button
        onClick={() => {
          send();
        }}
      >
        Send
      </button>
      <br />
      <button
        onClick={() => {
          receive();
        }}
      >
        Receive
      </button>
    </main>
  );
}
