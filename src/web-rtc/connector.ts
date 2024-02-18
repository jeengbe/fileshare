import { WebRtcSignalingServer } from './signaling-server';

export interface WebRtcSignalingServerConnector {
  connect(): Promise<WebRtcSignalingServer>;
}
