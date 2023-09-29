import { FILTER_PARAM_MAPPING, FilterParams, IFilter } from '../../src-common/types/filter';

export class FilterNode implements IFilter {
  id: string;
  private biquad: BiquadFilterNode;

  constructor(id: string, context: AudioContext) {
    this.id = id;
    this.biquad = context.createBiquadFilter();
  }
  
  getFrequency(): number {
    return this.biquad.frequency.value;
  }

  setFrequency(freq: number): void {
    this.setAudioParam('frequency', freq)
  }

  getGain(): number {
    return this.biquad.gain.value;
  }

  setGain(gain: number): void {
    this.setAudioParam('gain', gain);
  }

  getQ(): number {
    return this.biquad.Q.value;
  }

  setQ(q: number): void {
    this.setAudioParam('Q', q);
  }
  
  getType(): BiquadFilterType {
    return this.biquad.type;
  }
  
  setType(type: BiquadFilterType): void {
    this.biquad.type = type;
  }
  
  usesQ(): boolean {
    return FILTER_PARAM_MAPPING[this.biquad.type].usesQ;
  }
  
  usesGain(): boolean {
    return FILTER_PARAM_MAPPING[this.biquad.type].usesGain;
  }
  
  toFilterParams(): FilterParams {
    return {
      id: this.id,
      frequency: this.getFrequency(),
      gain: this.getGain(),
      q: this.getQ(),
      type: this.getType()
    };
  }

  static fromFilterParams(params: FilterParams, context: AudioContext): FilterNode {
    const node = new FilterNode(params.id, context);
    node.setType(params.type);
    node.setFrequency(params.frequency);
    node.setGain(params.gain);
    node.setQ(params.q);
    return node;
  }

  getBiquad(): BiquadFilterNode {
    return this.biquad;
  }

  connect(node: AudioNode) {
    this.biquad.connect(node);
  }

  disconnect() {
    this.biquad.disconnect();
  }

  private setAudioParam(key: 'frequency'|'Q'|'gain', value: number) {
    this.biquad[key].value = value;
  }
}
