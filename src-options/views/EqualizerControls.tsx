import { useCallback, useEffect, useState } from 'react';
import { FilterChanges } from '../../src-common-ui/CanvasPlot';
import ViewWrapper from './ViewWrapper';
import { Button } from '../../src-common-ui/Button';
import { CanvasPlot } from '../../src-common-ui/CanvasPlot';
import { HBox, HSpacer, VBox, VSpacer } from '../../src-common-ui/FlexBox';
import equalizer from '../eq/equalizer';
import { AUDIO_CONTEXT, FREQ_START, NYQUIST } from '../../src-common/audio-constants';
import debounce from '../../src-common/debounce';
import Dial from '../../src-common-ui/Dial';
import styled from 'styled-components';
import { FilterParams } from '../../src-common/types/filter';
import { FilterNode } from '../eq/filters';
import uuid from '../../src-common/utils/uuid';
import { EQState } from '../../src-common/types/equalizer';
import { StorageKeys } from '../../src-common/storage-keys';
import { load, save } from '../../src-common/utils/storageUtils';
import { DEFAULT_STATE } from '../../src-common/defaults';
import isDefined from '../../src-common/utils/isDefined';
import { NativeSelect } from '../../src-common-ui/Choose';

const DIAL_SIZE = 75;

const frequencyToValue = (value: number) => (Math.log10(value / NYQUIST) / Math.log10(NYQUIST / FREQ_START)) + 1;
const valueToFrequency = (value: number) => Math.pow(10, (Math.log10(NYQUIST / FREQ_START) * (value - 1)) + Math.log10(NYQUIST));

const saveStateDebounced = debounce((state: EQState) => {
  save(StorageKeys.EQ_STATE, state);
}, 500);

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
  const [ selectedIndex, setSelectedIndex ] = useState<number|null>(null);
  const [ currentParams, setCurrentParams ] = useState<FilterParameters>(DEFAULT_PARAMS);
  const [ preampValue, setPreampValue ] = useState<number>(1.0);
  const [ filterType, setFilterType ] = useState<BiquadFilterType>('peaking');

  useEffect(() => {
    load(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
      setFilters(state.filters);
      setPreampValue(state.preamp);
      if (state.filters.length) {
        setSelectedIndex(0);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedIndex === null) {
      setCurrentParams(DEFAULT_PARAMS);
    } else {
      setCurrentParams(filters[selectedIndex]);
    }
  }, [filters, selectedIndex]);

  const handleSelectedFilterChanged = useCallback((index: number|null) => {
    setSelectedIndex(index);
  }, []);

  const handleFilterChanged = useCallback(({ frequency, gain, q, type }: FilterChanges) => {
    if (selectedIndex === null) return;
    const filter = filters[selectedIndex];
    if (isDefined(frequency)) filter.frequency = frequency!!;
    if (isDefined(gain)) filter.gain = gain!!;
    if (isDefined(q)) filter.q = q!!;
    if (isDefined(type)) filter.type = type!!;
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
    const newFilter: FilterParams = { id: uuid(), frequency, gain: 0.0, q: 1.0, type: 'peaking' };
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
    if (selectedIndex > 0) {
      handleSelectedFilterChanged(selectedIndex - 1);
    }
  }, [selectedIndex, filters, preampValue]);

  const handleGainChanged = useCallback((gain: number) => {
    handleFilterChanged({ gain });
  }, [handleFilterChanged]);
  
  const handleFreqChanged = useCallback((freq: number) => {
    handleFilterChanged({ frequency: valueToFrequency(freq) });
  }, [handleFilterChanged]);

  const handleQChanged = useCallback((q: number) => {
    handleFilterChanged({ q });
  }, [handleFilterChanged]);

  const handleFilterTypeChanged = useCallback((type: BiquadFilterType) => {
    handleFilterChanged({ type });
  }, [handleFilterChanged]);

  const handlePreampChanged = useCallback((preamp: number) => {
    equalizer.updatePreamp(preamp);
    setPreampValue(preamp);
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
              <NativeSelect
                value={currentParams.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterTypeChanged(e.target.value as BiquadFilterType)}
              >
                <option value="peaking">Peaking</option>
                <option value="lowpass">Lowpass</option>
                <option value="highpass">Highpass</option>
                <option value="lowshelf">Low Shelf</option>
                <option value="highshelf">High Shelf</option>
                <option value="notch">Notch</option>
              </NativeSelect>
              <Dial
                label="Freq."
                value={frequencyToValue(currentParams.frequency)}
                min={0}
                max={1}
                size={DIAL_SIZE}
                onChange={handleFreqChanged}
              />
              <Dial
                label="Gain"
                onZero={() => handleGainChanged(0.0)}
                value={currentParams.gain}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={handleGainChanged}
              />
              <Dial
                label="Q"
                onZero={() => handleQChanged(1.0)}
                value={currentParams.q}
                min={0.1}
                max={10}
                size={DIAL_SIZE}
                onChange={handleQChanged}
              />
              <Dial
                label="Preamp"
                onZero={() => handlePreampChanged(0.0)}
                value={preampValue}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={handlePreampChanged}
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
      {currentParams.frequency.toFixed(0)}
    </ViewWrapper>
  );
}

export default EqualizerControls;
