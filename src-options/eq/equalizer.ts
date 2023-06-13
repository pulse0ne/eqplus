import { FilterParams, IFilter } from '../../src-common/types/filter';
import { toScalar, toDecibel } from '../../src-common/utils/scalarDecibelConverter';
import { FilterNode } from './filters';

export class Equalizer {
  private filters: FilterNode[];
  private context: AudioContext;
  private source: MediaStreamAudioSourceNode|null;
  private preamp: GainNode;
  private bypassed: boolean;

  constructor(context: AudioContext) {
    this.context = context;
    this.filters = [];
    this.source = null;
    this.preamp = this.context.createGain();
    this.bypassed = false;
  }

  connectToStream(stream: MediaStream) {
    this.source = this.context.createMediaStreamSource(stream);
    this.source.connect(this.preamp);
    if (this.filters.length) {
      this.preamp.connect(this.filters[0].getBiquad());
    } else {
      this.preamp.connect(this.context.destination);
    }
  }

  destroy() {
    this.context.close();
    this.source = null;
    this.filters = [];
  }

  bypass(enabled: boolean) {
    this.source?.disconnect();
    if (enabled) {
      this.source?.connect(this.context.destination);
    } else {
      this.source?.connect(this.preamp);
    }
    this.bypassed = enabled;
  }

  updateFilter(index: number, params: FilterParams): IFilter {
    const targetFilter = this.filters[index];
    const { frequency, gain, q, type } = params;
    targetFilter.setFrequency(frequency);
    targetFilter.setGain(gain);
    targetFilter.setQ(q);
    targetFilter.setType(type);
    // TODO; save to storage
    return targetFilter;
  }

  updatePreamp(level: number) {
    this.preamp.gain.value = toScalar(level);
    // TODO: save to storage
  }

  addFilter(params: FilterParams): IFilter {
    const filter = FilterNode.fromFilterParams(params, this.context);
    this.filters.push(filter);
    if (this.filters.length === 1) {
      this.preamp.disconnect();
      this.preamp.connect(filter.getBiquad());
    } else {
      const lastFilter = this.filters[this.filters.length - 1];
      lastFilter.disconnect();
      lastFilter.connect(filter.getBiquad());
    }
    filter.connect(this.context.destination);
    // TODO: save to storage
    return filter;
  }

  removeFilter(index: number) {
    if (index === 0) {
      this.preamp.disconnect();
      this.filters[index].disconnect();
      this.filters.splice(index, 1);
      if (this.filters.length) {
        this.preamp.connect(this.filters[0].getBiquad());
      } else {
        this.preamp.connect(this.context.destination);
      }
    } else {
      this.filters[index - 1].disconnect();
      this.filters[index].disconnect();
      this.filters.splice(index, 1);
      if (index === this.filters.length) {
        this.filters[index - 1].connect(this.context. destination);
      } else {
        this.filters[index - 1].connect(this.filters[index].getBiquad());
      }
    }
    // TODO: save to storage
  }

  getFilter(index: number): IFilter {
    return this.filters[index];
  }

  getAllFilters(): IFilter[] {
    return [...this.filters];
  }

  getPreampLevel(): number {
    return toDecibel(this.preamp.gain.value);
  }

  isBypassed(): boolean {
    return this.bypassed;
  }

  static fromParams(params: FilterParams[], context: AudioContext): Equalizer {
    const eq = new Equalizer(context);
    params.forEach(p => eq.addFilter(p));
    return eq;
  }
}
