export type FilterParams = {
  id: string,
  frequency: number,
  gain: number,
  q: number,
  type: BiquadFilterType
};

export interface IFilter {
  id: string,
  
  getFrequency(): number,
  setFrequency(freq: number): void,
  
  getGain(): number,
  setGain(gain: number): void,
  
  getQ(): number,
  setQ(q: number): void,

  getType(): BiquadFilterType,
  setType(type: BiquadFilterType): void,

  usesQ(): boolean,
  usesGain(): boolean,

  toFilterParams(): FilterParams
}

export type FilterChanges = {
  frequency?: number,
  gain?: number,
  q?: number,
  type?: BiquadFilterType
};
