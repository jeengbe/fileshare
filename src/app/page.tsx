'use client';

import { Button } from '@/components/ui/button';
import { GitHubIcon } from '@/components/ui/github-icon';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='flex flex-col h-screen items-center justify-between gap-32'>
      <div />
      <main className='flex flex-col gap-2 items-center'>
        <section className='flex flex-col gap-12 shadow-sm rounded-lg p-16 py-12 pb-14 border bg-card text-card-foreground'>
          <div className='flex flex-col space-y-1.5 items-center'>
            <h1 className='text-2xl font-semibold leading-none tracking-tight'>
              Browser File Sharing
            </h1>
            <p className='text-sm text-muted-foreground'>
              Share Files Easily and Securely
            </p>
          </div>
          <div className='flex flex-col gap-4 items-center'>
            <Button className='w-full' asChild>
              <Link href='/send'>Send</Link>
            </Button>
            <Button className='w-full' asChild>
              <Link href='/receive'>Receive</Link>
            </Button>
          </div>
        </section>
        <section>
          <Link
            className='text-muted-foreground underline underline-offset-2 hover:text-blue-500 transition-colors'
            href='/about'
          >
            How it works -&gt;
          </Link>
        </section>
      </main>
      <footer className='flex justify-center w-full gap-2 pb-4'>
        <Link
          className='text-secondary-foreground hover:text-blue-500 transition-colors flex items-center gap-1'
          target='_blank'
          href='https://github.com/jeengbe/fileshare'
        >
          <span className='inline-block text-secondary-foreground size-4'>
            <GitHubIcon />
          </span>
          GitHub
        </Link>
        <span className='text-secondary-foreground'>&#x2022;</span>
        <Link
          className='text-secondary-foreground hover:text-blue-500 transition-colors'
          href='/privacy'
        >
          Privacy Policy
        </Link>
        <span className='text-secondary-foreground'>&#x2022;</span>
        <Link
          className='text-secondary-foreground hover:text-blue-500 transition-colors'
          href='/legal'
        >
          Legal Notice
        </Link>
      </footer>
    </div>
  );
}
