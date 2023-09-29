import { DEFAULT_STATE } from '../../src-common/defaults';
import { StorageKeys } from '../../src-common/storage-keys';
import { FilterParams, IFilter } from '../../src-common/types/filter';
import { toDecibel, toScalar } from '../../src-common/utils/scalarDecibelConverter';
import { load } from '../../src-common/utils/storageUtils';
import contextHolder from './contextHolder';
import { FilterNode } from './filters';

export class Equalizer {
  private filters: FilterNode[];
  private source: MediaStreamAudioSourceNode|null;
  private preamp: GainNode;
  private bypassed: boolean;

  constructor() {
    this.filters = [];
    this.source = null;
    this.preamp = contextHolder.getContext().createGain();
    this.bypassed = false;
  }

  connectToStream(stream: MediaStream) {
    this.source = contextHolder.getContext().createMediaStreamSource(stream);
    if (this.filters.length) {
      this.preamp.connect(this.filters[0].getBiquad());
    } else {
      this.preamp.connect(contextHolder.getContext().destination);
    }
    this.source.connect(this.preamp);
  }

  disconnectFromStream() {
    if (this.source) {
      this.source.mediaStream.getAudioTracks()[0].stop();
    }
    this.source = null;
    this.filters = [];
  }

  bypass(enabled: boolean) {
    this.source?.disconnect();
    if (enabled) {
      this.source?.connect(contextHolder.getContext().destination);
    } else {
      this.source?.connect(this.preamp);
    }
    this.bypassed = enabled;
  }

  updateFilter(id: string, params: FilterParams) {
    const targetFilter = this.filters.find(f => f.id === id);
    if (!targetFilter) return;
    const { frequency, gain, q, type } = params;
    targetFilter.setFrequency(frequency);
    targetFilter.setGain(gain);
    targetFilter.setQ(q);
    targetFilter.setType(type);
  }

  updatePreamp(level: number = 0) {
    this.preamp.gain.value = toScalar(level);
  }

  addFilter(params: FilterParams): IFilter {
    this.disconnectNodes();
    const filter = FilterNode.fromFilterParams(params, contextHolder.getContext());
    this.filters.push(filter);
    this.connectNodes();
    return filter;
  }

  removeFilter(id: string) {
    const index = this.filters.findIndex(f => f.id === id);
    if (index < 0) return;

    this.disconnectNodes();
    this.filters.splice(index, 1);
    this.connectNodes();
  }

  setFilters(params: FilterParams[]) {
    this.disconnectNodes();
    this.filters.length = 0;
    this.filters = params.map(p => FilterNode.fromFilterParams(p, contextHolder.getContext()));
    this.connectNodes();
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

  load() {
    load(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
      this.updatePreamp(state.preamp);
      state.filters.forEach(f => this.addFilter(f));
    })
  }

  private disconnectNodes() {
    this.source?.disconnect();
    this.preamp.disconnect();
    this.filters.forEach(f => f.disconnect());
  }

  private connectNodes() {
    if (this.filters.length) {
      this.filters.forEach((f, ix, arr) => {
        if (ix > 0) {
          this.filters[ix - 1].connect(f.getBiquad());
        }
        if (ix === arr.length - 1) {
          f.connect(contextHolder.getContext().destination);
        }
      });
      this.preamp.connect(this.filters[0].getBiquad());
      this.source?.connect(this.preamp);
    } else {
      this.source?.connect(contextHolder.getContext().destination);
    }
  }

  static fromParams(params: FilterParams[]): Equalizer {
    const eq = new Equalizer();
    params.forEach(p => eq.addFilter(p));
    return eq;
  }
}

export default new Equalizer();
