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

  const oldOnOpen = channel.onopen;
  const oldOnError = channel.onerror;

  await new Promise((resolve, reject) => {
    channel.onopen = resolve;
    channel.onerror = reject;
  });

  channel.onopen = oldOnOpen;
  channel.onerror = oldOnError;
}
