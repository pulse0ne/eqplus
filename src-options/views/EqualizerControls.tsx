import { useCallback, useEffect, useState } from 'react';
import { FilterChanges } from '../components/CanvasPlot';
import ViewWrapper from './ViewWrapper';
import EQPlus from '../../src-common/types';
import { Button } from '../components/Button';
import uuid from '../utils/uuid';
import { CanvasPlot } from '../components/CanvasPlot';
import { HBox, HSpacer } from '../components/FlexBox';
import equalizer from '../eq/equalizer';
import { FREQ_START, NYQUIST } from '../../src-common/audio-constants';
import loadStorageValue from '../utils/loadStorageValue';
import { DEFAULT_STATE } from '../../src-common/defaults';
import debounce from '../../src-common/debounce';

const saveStateDebounced = debounce((state: EQPlus.EQState) => {
  chrome.storage.local.set({ [EQPlus.Keys.EQ_STATE]: state });
}, 500);

function EqualizerControls () {
  const [ filters, setFilters ] = useState<EQPlus.Filter[]>([]);
  const [ preampValue, setPreampValue ] = useState<number>(1.0);
  const [ selectedIndex, setSelectedIndex ] = useState<number|null>(null);
  const [ currentFreq, setCurrentFreq ] = useState<number>(FREQ_START);

  useEffect(() => {
    loadStorageValue(EQPlus.Keys.EQ_STATE, DEFAULT_STATE).then(state => {
      setFilters(state.filters);
      setPreampValue(state.preampValue);
    });
  }, []);

  useEffect(() => {
    if (selectedIndex === null) {
      setCurrentFreq(FREQ_START);
    } else {
      setCurrentFreq(filters[selectedIndex].frequency);
    }
  }, [filters, selectedIndex]);

  const handleSelectedFilterChanged = useCallback((index: number|null) => {
    setSelectedIndex(index);
  }, []);

  const handleFilterChanged = useCallback(({ frequency, gain, q }: FilterChanges) => {
    if (selectedIndex === null) return;
    const filter = filters[selectedIndex];
    if (frequency) filter.frequency = frequency;
    if (gain) filter.gain = gain;
    if (q) filter.q = q;
    setFilters([...filters]);
    equalizer.updateFilter(selectedIndex, filter);
    saveStateDebounced({ filters, preampValue });
  }, [filters, selectedIndex, preampValue]);

  const handleAddFilter = useCallback((freq?: number) => {
    let frequency: number;
    if (freq) {
      frequency = freq;
    } else { // find the biggest 'gap' and place the freq there
      const freqs = [FREQ_START, ...filters.map(f => f.frequency).sort((a, b) => a - b), NYQUIST];
      const gap = freqs.reduce((acc, curr) => {
        const delta = Math.log10(curr) - Math.log10(acc.last);
        if (delta > acc.d) {
          acc.d = delta;
          acc.l = acc.last;
          acc.r = curr;
        }
        acc.last = curr;
        return acc;
      }, { last: FREQ_START, l: 0, r: 0, d: 0 });
      frequency = Math.sqrt(gap.l * gap.r);
    }
    const newFilter: EQPlus.Filter = { id: uuid(), frequency, gain: 0.0, q: 1.0, type: 'peaking' };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    handleSelectedFilterChanged(newFilters.length - 1);
    equalizer.addFilter(newFilter);
    saveStateDebounced({ filters, preampValue });
  }, [filters, preampValue]);

  const handleRemoveFilter = useCallback(() => {
    if (selectedIndex === null) return;
    const newFilters = [...filters];
    newFilters.splice(selectedIndex, 1);
    setFilters(newFilters);
    equalizer.removeFilter(selectedIndex);
    saveStateDebounced({ filters, preampValue });
    handleSelectedFilterChanged(null);
  }, [selectedIndex, filters, preampValue]);

  return (
    <ViewWrapper>
      <CanvasPlot
        disabled={false}
        filters={filters}
        activeNodeIndex={selectedIndex}
        onHandleSelected={handleSelectedFilterChanged}
        onFilterChanged={handleFilterChanged}
        onFilterAdded={handleAddFilter}
      />
      <HBox>
        <Button onClick={() => handleAddFilter()}>Add Filter</Button>
        <HSpacer size={2} />
        <Button onClick={() => handleRemoveFilter()} disabled={selectedIndex === null}>Remove Filter</Button>
      </HBox>
      {currentFreq.toFixed(0)}
    </ViewWrapper>
  );
}

export default EqualizerControls;
