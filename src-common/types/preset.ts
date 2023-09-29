import { FilterParams } from './filter';

export type Preset = {
  name: string,
  locked: boolean,
  filters: FilterParams[],
  preampGain: number
};
