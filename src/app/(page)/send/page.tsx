import { GitHubIcon } from '@/components/ui/github-icon';
import Link from 'next/link';
import { Send } from './clients';

export default function Page() {
  return (
    <div className='flex flex-col h-screen items-center justify-between gap-32'>
      <div />
      <main className='flex flex-col gap-2 items-center'>
        <Send />
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
