import streamSaver from 'streamsaver';

export type FileDownloader = (info: {
  fileId: string;
  filename: string;
  size: number;
  stream: ReadableStream<Uint8Array>;
}) => Promise<void>;

export function useDownload(): FileDownloader | null {
  return async ({ stream, filename, size }) => {
    const writable = streamSaver.createWriteStream(filename, {
      size,
    }) as WritableStream<Uint8Array>;

    await stream.pipeTo(writable);
  };
}
