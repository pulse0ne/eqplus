import { useCallback, useEffect, useState } from 'react';
import { FilterChanges } from '../../src-common-ui/CanvasPlot';
import ViewWrapper from './ViewWrapper';
import { Button } from '../../src-common-ui/Button';
import { CanvasPlot } from '../../src-common-ui/CanvasPlot';
import { HBox, HSpacer, VBox, VSpacer } from '../../src-common-ui/FlexBox';
// import equalizer from '../eq/equalizer';
import { AUDIO_CONTEXT, FREQ_START, NYQUIST } from '../../src-common/audio-constants';
// import loadStorageValue from '../utils/loadStorageValue';
// import { DEFAULT_STATE } from '../../src-common/defaults';
// import debounce from '../../src-common/debounce';
import Dial from '../../src-common-ui/Dial';
import styled from 'styled-components';
// import { StorageKeys } from '../../src-common/types';
import { FilterParams } from '../../src-common/types/filter';
import { FilterNode } from '../eq/filters';
import uuid from '../../src-common/utils/uuid';

const DIAL_SIZE = 75;

const frequencyToValue = (value: number) => (Math.log10(value / NYQUIST) / Math.log10(NYQUIST / FREQ_START)) + 1;

// const saveStateDebounced = debounce((state: EQPlus.EQState) => {
//   chrome.storage.local.set({ [StorageKeys.EQ_STATE]: state });
// }, 500);

const Surface = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 8px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
`;

type FilterParameters = Omit<FilterParams, 'id'>;

const DEFAULT_PARAMS: FilterParameters = {
  frequency: FREQ_START,
  gain: 0.0,
  q: 1.0,
  type: 'peaking'
};

function EqualizerControls () {
  const [ filters, setFilters ] = useState<FilterParams[]>([]);
  const [ preampValue, setPreampValue ] = useState<number>(1.0);
  const [ selectedIndex, setSelectedIndex ] = useState<number|null>(null);
  const [ currentFreq, setCurrentFreq ] = useState(FREQ_START);
  const [ currentGain, setCurrentGain ] = useState(0.0);
  const [ currentParams, setCurrentParams ] = useState(DEFAULT_PARAMS);

  useEffect(() => {
    // loadStorageValue(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
    //   setFilters(state.filters);
    //   setPreampValue(state.preampValue);
    // });
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
    // equalizer.updateFilter(selectedIndex, filter);
    // saveStateDebounced({ filters, preampValue });
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
    const newFilter: FilterParams = { id: uuid(), frequency, gain: 0.0, q: 1.0, type: 'peaking' };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    handleSelectedFilterChanged(newFilters.length - 1);
    // equalizer.addFilter(newFilter);
    // saveStateDebounced({ filters, preampValue });
  }, [filters, preampValue]);

  const handleRemoveFilter = useCallback(() => {
    if (selectedIndex === null) return;
    const newFilters = [...filters];
    newFilters.splice(selectedIndex, 1);
    setFilters(newFilters);
    // equalizer.removeFilter(selectedIndex);
    // saveStateDebounced({ filters, preampValue });
    handleSelectedFilterChanged(null);
  }, [selectedIndex, filters, preampValue]);

  const handleGainChanged = useCallback((newGain: number) => {
    console.log(newGain);
    setCurrentGain(newGain)
  }, []);

  return (
    <ViewWrapper>
      <HBox>
        <VBox>
          <CanvasPlot
            disabled={false}
            filters={filters.map(i => FilterNode.fromFilterParams(i, AUDIO_CONTEXT))}
            activeNodeIndex={selectedIndex}
            onHandleSelected={handleSelectedFilterChanged}
            onFilterChanged={handleFilterChanged}
            onFilterAdded={handleAddFilter}
          />
          <Surface>
            <HBox alignItems="center" justifyContent="space-around">
              <Dial
                label="Freq."
                value={frequencyToValue(currentFreq)}
                min={0}
                max={1}
                size={DIAL_SIZE}
              />
              <Dial
                label="Gain"
                onZero={() => handleGainChanged(0.0)}
                value={currentGain}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={handleGainChanged}
              />
              <Dial
                label="Q"
                onZero={() => console.log('zero')}
                value={1.0}
                min={0.1}
                max={10}
                size={DIAL_SIZE}
                onChange={(nv) => console.log(nv)}
              />
              <Dial
                label="Preamp"
                onZero={() => console.log('zero')}
                value={0}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={(nv) => console.log(nv)}
              />
            </HBox>
            
          </Surface>
        </VBox>
      </HBox>
      <VSpacer size={2} />
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
