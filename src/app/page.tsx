'use client';

import Link from 'next/link';

// @ts-expect-error -- Polyfill
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error -- Polyfill
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export default function Page() {
  return (
    <div>
      <div>
        <h1>P2P File Sharing</h1>
      </div>
      <div>
        <Link href='/send'>Send</Link>
        <Link href='/receive'>Receive</Link>
      </div>
    </div>
  );
}
