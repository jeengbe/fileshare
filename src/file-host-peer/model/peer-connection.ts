import { ChannelManager } from '@/file-host-stream/channel-manager';

export interface PeerConnection {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  channelManager: ChannelManager;
}
