import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DisposePolyfill } from './symbol-dispose';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'File Share: Seamless & Secure Peer-to-Peer Sharing Platform',
  description:
    "File Share offers a cutting-edge solution for peer-to-peer file transfers. Embrace the ease of sharing files directly between devices without intermediaries, ensuring your data's security with robust encryption protocols. Whether for work or leisure, File Share supports all file types and sizes, facilitating limitless sharing possibilities. Get started with File Share today for fast, secure, and straightforward file exchanges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className=''>
      <DisposePolyfill />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
