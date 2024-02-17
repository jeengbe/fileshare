/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

export type MessageDataToSw = DownloadMessageDataToSw | PingMessageDataToSw;

interface DownloadMessageDataToSw {
  type: 'download';
  id: string;
  filename: string;
  size: number;
  port: MessagePort;
}

interface PingMessageDataToSw {
  type: 'ping';
}

export type PortDataToSw = DataPortDataToSw | ClosePortDataToSw;

interface DataPortDataToSw {
  type: 'data';
  chunk: Uint8Array;
}

interface ClosePortDataToSw {
  type: 'close';
}

export type PortDataFromSw = ClosePortDataFromSw;

interface ClosePortDataFromSw {
  type: 'close';
}

interface Download {
  stream: ReadableStream<Uint8Array>;
  filename: string;
  size: number;
}

const downloads = new Map<string, Download>();

self.addEventListener('message', (event) => {
  const data = event.data as MessageDataToSw;

  switch (data.type) {
    case 'ping':
      break;
    case 'download': {
      downloads.set(data.id, {
        stream: new ReadableStream({
          start(controller) {
            data.port.onmessage = (event) => {
              const data = event.data as PortDataToSw;

              switch (data.type) {
                case 'data':
                  controller.enqueue(data.chunk);
                  break;
                case 'close':
                  controller.close();
                  break;
              }
            };
          },
          async cancel() {
            data.port.postMessage({
              type: 'close',
            } satisfies PortDataFromSw);

            data.port.close();
          },
        }),
        filename: data.filename,
        size: data.size,
      });
    }
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  if (!url.pathname.startsWith('/download')) return;

  const downloadId = url.pathname.split('/')[2];

  const download = downloads.get(downloadId);

  if (download) {
    downloads.delete(downloadId);

    const { stream, filename, size } = download;

    event.respondWith(
      new Response(stream, {
        headers: new Headers({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': size.toString(),
        }),
      }),
    );
  } else {
    event.respondWith(new Response(null, { status: 404 }));
  }
});
