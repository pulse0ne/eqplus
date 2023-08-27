export class ContextHolder {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext({ latencyHint: 'playback' });
  }

  getContext(): AudioContext {
    return this.audioContext;
  }

  reset(): AudioContext {
    this.audioContext.close();
    this.audioContext = new AudioContext({ latencyHint: 'playback' });
    return this.audioContext;
  }
}

export default new ContextHolder();
