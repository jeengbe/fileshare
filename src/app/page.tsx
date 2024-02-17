'use client';

import { Button } from '@/components/ui/button';
import { GitHubIcon } from '@/components/ui/github-icon';
import Link from 'next/link';

// @ts-expect-error -- Polyfill
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error -- Polyfill
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export default function Page() {
  return (
    <div className='flex flex-col h-screen justify-center items-center gap-32'>
      <div className='flex flex-col gap-2 justify-center items-center flex-1'>
        <div className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
          <div className='flex flex-col space-y-1.5 items-center'>
            <div className='text-2xl font-semibold leading-none tracking-tight'>
              P2P File Sharing
            </div>
            <div className='text-sm text-muted-foreground'>
              Share Files Easily and Securely
            </div>
          </div>
          <div className='flex flex-col gap-4 items-center pt-0'>
            <Button className='w-full' asChild>
              <Link href='/share'>Send</Link>
            </Button>
            <Button className='w-full' asChild>
              <Link href='/receive'>Receive</Link>
            </Button>
          </div>
        </div>
        <div className='text-muted-foreground underline underline-offset-2 hover:text-blue-500 transition-colors flex'>
          <Link href='/about'>How it works -&gt;</Link>
        </div>
      </div>
      <div className='flex justify-center w-full gap-2 pb-4'>
        <Link
          className='text-secondary-800 hover:text-blue-500 transition-colors flex items-center gap-1'
          target='_blank'
          href='https://github.com/jeengbe/fileshare'
        >
          <span className='inline-block text-secondary-500 size-4'>
            <GitHubIcon />
          </span>
          GitHub
        </Link>
        <span className='text-secondary-500'>&#x2022;</span>
        <Link
          className='text-secondary-800 hover:text-blue-500 transition-colors'
          href='/privacy'
        >
          Privacy Policy
        </Link>
        <span className='text-secondary-500'>&#x2022;</span>
        <Link
          className='text-secondary-800 hover:text-blue-500 transition-colors'
          href='/legal'
        >
          Legal Notice
        </Link>
      </div>
    </div>
  );
}
