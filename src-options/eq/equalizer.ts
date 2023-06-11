// import { Filter } from '../../src-common/types/filter';
// import { toScalar } from '../utils/scalarDecibelConverter';

import { AUDIO_CONTEXT } from '../../src-common/audio-constants';
import { FilterNode } from './filters';

// export interface IEqualizer {
//   connect: (filters: Filter[], stream: MediaStream) => void,
//   destroy: () => void,
//   bypass: (enabled: boolean) => void,
//   updateFilter: (index: number, filter: Filter) => void,
//   removeFilter: (index: number) => void,
//   addFilter: (filter: Filter) => void,
//   updatePreamp: (value: number) => void,
//   getFilter: (index: number) => BiquadFilterNode
// };

// class Equalizer implements IEqualizer {
//   private audioContext: AudioContext;
//   private filters: BiquadFilterNode[];
//   private preamp: GainNode;
//   private source: MediaStreamAudioSourceNode|null;

//   constructor() {
//     this.audioContext = new AudioContext({ latencyHint: 'playback' });
//     this.preamp = this.audioContext.createGain();
//     this.source = null;
//     this.filters = [];
//   }

//   connect(filters: Filter[], stream: MediaStream) {
//     this.source = this.audioContext.createMediaStreamSource(stream);
//     this.source.connect(this.preamp);
//     filters.forEach(this.addFilter);
//     if (this.filters.length) {
//       this.preamp.connect(this.filters[0]);
//     } else {
//       this.preamp.connect(this.audioContext.destination);
//     }
//   }

//   destroy() {
//     this.audioContext?.close();
//     this.source = null;
//     this.audioContext = new AudioContext({ latencyHint: 'playback' });
//     this.preamp = this.audioContext.createGain();
//   }
  
//   bypass(enabled: boolean) {
//     if (enabled) {
//       this.source?.disconnect();
//       this.source?.connect(this.audioContext.destination);
//     } else {
//       this.source?.disconnect();
//       this.source?.connect(this.preamp);
//     }
//   }

//   updateFilter(index: number, filter: Filter) {
//     const targetFilter = this.filters[index];
//     this.setFilterParams(targetFilter, filter);
//   }

//   removeFilter(index: number) {
//     if (index === 0) {
//       this.preamp.disconnect();
//       this.filters[index].disconnect();
//       this.filters.splice(index, 1);
//       if (this.filters.length) {
//         this.preamp.connect(this.filters[0]);
//       } else {
//         this.preamp.connect(this.audioContext.destination);
//       }
//     } else {
//       this.filters[index - 1].disconnect();
//       this.filters[index].disconnect();
//       this.filters.splice(index, 1);
//       if (index === this.filters.length) {
//         this.filters[index - 1].connect(this.audioContext.destination);
//       } else {
//         this.filters[index - 1].connect(this.filters[index]);
//       }
//     }
//   }
  
//   addFilter(filter: Filter) {
//     const filterNode = this.audioContext.createBiquadFilter();
//     filterNode.addEventListener('change', () => console.log('change'));
//     this.setFilterParams(filterNode, filter);
//     if (!this.filters.length) {
//       this.preamp.disconnect();
//       this.filters.push(filterNode);
//       this.preamp.connect(filterNode);
//       filterNode.connect(this.audioContext.destination);
//     } else {
//       const lastFilter = this.filters[this.filters.length - 1];
//       lastFilter.disconnect();
//       this.filters.push(filterNode);
//       lastFilter.connect(filterNode);
//       filterNode.connect(this.audioContext.destination);
//     }
//   }

//   private setFilterParams(node: BiquadFilterNode, filter: Filter) {
//     const { getFrequency, getGain, getQ, getType } = filter;
//     node.frequency.setValueAtTime(getFrequency(), this.audioContext.currentTime);
//     node.gain.setValueAtTime(getGain(), this.audioContext.currentTime);
//     node.Q.setValueAtTime(getQ(), this.audioContext.currentTime);
//     node.type = getType();
//   }
  
//   updatePreamp(valueDecibels: number) {
//     this.preamp.gain.value = toScalar(valueDecibels);
//   }

//   removeAllFilters() {
//     const len = this.filters.length;
//     for (let i = len - 1; i >= 0; i++) {
//       this.removeFilter(i);
//     }
//   }

//   getFilter(index: number): BiquadFilterNode {
//     return this.filters[index];
//   }
// }

// export default new Equalizer();

// export interface IEqualizer {
//   // connect: (filters: FilterNode[], stream: MediaStream) => void,
//   // destroy: () => void,
//   // bypass: (enabled: boolean) => void,
//   // updateFilter: (index: number, filter: Filter) => void,
//   // removeFilter: (index: number) => void,
//   // addFilter: (filter: Filter) => void,
//   // updatePreamp: (value: number) => void,
//   // getFilter: (index: number) => BiquadFilterNode
  
// }

class Equalizer {
  private filters: FilterNode[];
  private context: AudioContext;
  private source: MediaStreamAudioSourceNode|null;

  constructor(context: AudioContext) {
    this.context = context;
    this.filters = [];
    this.source = null;
  }
}

export default new Equalizer(AUDIO_CONTEXT);
