export async function createRtcChannel(
  peerConnection: RTCPeerConnection,
  label: string,
  id: number,
): Promise<RTCDataChannel> {
  const channel = peerConnection.createDataChannel(label, {
    negotiated: true,
    id,
  });

  await awaitChannelOpen(channel);

  return channel;
}

async function awaitChannelOpen(channel: RTCDataChannel): Promise<void> {
  if (channel.readyState === 'open') {
    return;
  }

  let onOpen!: () => void;
  let onClose!: () => void;

  const promise = new Promise<void>((resolve, reject) => {
    onOpen = resolve;
    onClose = () => {
      reject(new Error('Failed to open channel'));
    };
  });

  channel.addEventListener('open', onOpen);
  channel.addEventListener('close', onClose);

  try {
    await promise;
  } finally {
    channel.removeEventListener('open', onOpen);
    channel.removeEventListener('close', onClose);
  }
}
