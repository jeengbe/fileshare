import streamSaver from 'streamsaver';

streamSaver.mitm = './ss-mitm.html';

export type FileDownloader = (info: {
  fileId: string;
  filename: string;
  size: number;
  stream: ReadableStream<Uint8Array>;
}) => Promise<void>;

let downloads = 0;
const beforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();

  return 'There are downloads in progress. They will be canceled if you leave the page.';
};

export function useDownload(): FileDownloader | null {
  return async ({ stream, filename, size }) => {
    const writable = streamSaver.createWriteStream(filename, {
      size,
    }) as WritableStream<Uint8Array>;

    const abort = () => {
      void writable.close();
    };

    const donePromise = stream.pipeTo(writable);

    window.addEventListener('unload', abort);

    downloads++;

    if (downloads === 1) {
      window.addEventListener('beforeunload', beforeUnload);
    }

    await donePromise;

    downloads--;

    if (!downloads) {
      window.removeEventListener('beforeunload', beforeUnload);
    }

    window.removeEventListener('unload', abort);
  };
}
