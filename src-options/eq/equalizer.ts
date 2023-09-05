import debounce from '../../src-common/debounce';
import { DEFAULT_STATE } from '../../src-common/defaults';
import { StorageKeys } from '../../src-common/storage-keys';
import { EQState } from '../../src-common/types/equalizer';
import { FilterParams, IFilter } from '../../src-common/types/filter';
import { toDecibel, toScalar } from '../../src-common/utils/scalarDecibelConverter';
import { load, save } from '../../src-common/utils/storageUtils';
import contextHolder from './contextHolder';
import { FilterNode } from './filters';

const saveStateDebounced: (state: EQState) => void = debounce((state: EQState) => {
  save(StorageKeys.EQ_STATE, state);
}, 500);

function filterParamsFromNode(node: FilterNode): FilterParams {
  return {
    id: node.id,
    frequency: node.getFrequency(),
    gain: node.getGain(),
    q: node.getQ(),
    type: node.getType()
  };
}

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
    this.source.connect(this.preamp);
    if (this.filters.length) {
      this.preamp.connect(this.filters[0].getBiquad());
    } else {
      this.preamp.connect(contextHolder.getContext().destination);
    }
  }

  disconnectFromStream() {
    this.source?.mediaStream.getAudioTracks()[0].stop();
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

  updateFilter(index: number, params: FilterParams): IFilter {
    const targetFilter = this.filters[index];
    const { frequency, gain, q, type } = params;
    targetFilter.setFrequency(frequency);
    targetFilter.setGain(gain);
    targetFilter.setQ(q);
    targetFilter.setType(type);
    this.save();
    return targetFilter;
  }

  updatePreamp(level: number = 0) {
    this.preamp.gain.value = toScalar(level);
    this.save();
  }

  addFilter(params: FilterParams): IFilter {
    const filter = FilterNode.fromFilterParams(params, contextHolder.getContext());
    this.filters.push(filter);
    if (this.filters.length === 1) {
      this.preamp.disconnect();
      this.preamp.connect(filter.getBiquad());
    } else {
      const lastFilter = this.filters[this.filters.length - 1];
      lastFilter.disconnect();
      lastFilter.connect(filter.getBiquad());
    }
    filter.connect(contextHolder.getContext().destination);
    this.save();
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
        this.preamp.connect(contextHolder.getContext().destination);
      }
    } else {
      this.filters[index - 1].disconnect();
      this.filters[index].disconnect();
      this.filters.splice(index, 1);
      if (index === this.filters.length) {
        this.filters[index - 1].connect(contextHolder.getContext(). destination);
      } else {
        this.filters[index - 1].connect(this.filters[index].getBiquad());
      }
    }
    this.save();
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

  save() {
    saveStateDebounced({ filters: this.filters.map(filterParamsFromNode), preamp: this.preamp.gain.value });
  }

  static fromParams(params: FilterParams[]): Equalizer {
    const eq = new Equalizer();
    params.forEach(p => eq.addFilter(p));
    return eq;
  }
}

export default new Equalizer();
