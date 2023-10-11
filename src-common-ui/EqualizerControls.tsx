import { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { FREQ_START, NYQUIST } from '../src-common/audio-constants';
import { DisplayFilterNode, FILTER_PARAM_MAPPING, FilterChanges, FilterParams } from '../src-common/types/filter';
import { AudioIcon } from './AudioIcon';
import { CanvasPlot } from './CanvasPlot';
import { NativeSelect } from './Choose';
import { Dial } from './Dial';
import { HBox, VBox, VSpacer } from './FlexBox';
import { IconButton } from './Icon';
import { Logo } from './Logo';
import { NumberEditLabel } from './NumberEditLabel';

const DIAL_SIZE = 50;
const FILTER_ADD_REMOVE_BTN_SIZE = 32;

const frequencyToValue = (value: number) => (Math.log10(value / NYQUIST) / Math.log10(NYQUIST / FREQ_START)) + 1;
const valueToFrequency = (value: number) => Math.pow(10, (Math.log10(NYQUIST / FREQ_START) * (value - 1)) + Math.log10(NYQUIST));

const AUDIO_ICON_FILTER_MAP: Record<BiquadFilterType, string> = {
  allpass: 'filter-bypass',
  bandpass: 'filter-bandpass',
  highpass: 'filter-highpass',
  highshelf: 'filter-shelving-hi',
  lowpass: 'filter-lowpass',
  lowshelf: 'filter-shelving-lo',
  notch: 'filter-notch',
  peaking: 'filter-bell'
};

const Surface = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 8px 24px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
`;

const ControlLabel = styled.span`
  color: ${({ theme }) => theme.colors.controlLabel};
`;

type FilterParameters = Omit<FilterParams, 'id'>;

const DEFAULT_PARAMS: FilterParameters = {
  frequency: FREQ_START,
  gain: 0.0,
  q: 1.0,
  type: 'peaking'
};

export type EqualizerControlsProps = {
  filters: FilterParams[],
  preamp: number,
  drawCompositeResponse?: boolean,
  onFilterChanged: (index: number, changes: FilterChanges) => void,
  onPreampChanged: (value: number) => void,
  onFilterAdded: (freq: number) => void,
  onFilterRemoved: (index: number) => void
};

function EqualizerControls({
  filters,
  preamp,
  drawCompositeResponse,
  onFilterChanged,
  onPreampChanged,
  onFilterAdded,
  onFilterRemoved
}: EqualizerControlsProps) {
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
  const [ currentParams, setCurrentParams ] = useState<FilterParameters>(DEFAULT_PARAMS);
  const [ lastFiltersLength, setLastFiltersLength ] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    if (selectedIndex === null) {
      if (filters.length) {
        setSelectedIndex(0);
      }
    } else {
      if (filters.length > lastFiltersLength) { // use added a new filter
        setSelectedIndex(filters.length - 1);
        setLastFiltersLength(filters.length);
      } else if (filters.length < lastFiltersLength) { // user removed a filter
        setLastFiltersLength(filters.length);
      }
    }
  }, [filters, selectedIndex, lastFiltersLength]);

  useEffect(() => {
    if (selectedIndex === null) {
      setCurrentParams(DEFAULT_PARAMS);
    } else {
      setCurrentParams(filters[selectedIndex]);
    }
  }, [filters, selectedIndex]);

  const handleFilterChanged = useCallback((changes: FilterChanges) => {
    if (selectedIndex === null) return;
    onFilterChanged(selectedIndex, changes);
  }, [onFilterChanged, selectedIndex]);

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
    onFilterAdded(frequency);
  }, [filters, onFilterAdded]);

  const handleRemoveFilter = useCallback(() => {
    if (selectedIndex !== null) {
      const indexToRemove = selectedIndex;
      if (indexToRemove > 0) {
        setSelectedIndex(indexToRemove - 1);
      } else if (filters.length - 1 <= 0) {
        setSelectedIndex(null);
      }
      onFilterRemoved(indexToRemove);
    }
  }, [filters.length, onFilterRemoved, selectedIndex]);

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

  const handlePreampChanged = useCallback((value: number) => {
    onPreampChanged(value);
  }, [onPreampChanged]);

  return (
    <VBox>
      <CanvasPlot
        width={788}
        disabled={false}
        drawCompositeResponse={drawCompositeResponse}
        filters={filters.map(i => DisplayFilterNode.fromFilterParams(i))}
        activeNodeIndex={selectedIndex}
        onHandleSelected={setSelectedIndex}
        onFilterChanged={handleFilterChanged}
        onFilterAdded={handleAddFilter}
      />
      <Surface className="themed surface">
        <HBox alignItems="stretch" justifyContent="space-between">
          <VBox alignItems="center" justifyContent="center">
            <Logo size={64} fill={theme.colors.accentPrimary} />
          </VBox>
          <HBox alignItems="stretch" justifyContent="space-around" flex={1} id="param-controls">
            <VBox alignItems="center" id="dial-freq">
              <Dial
                label="Freq."
                disabled={selectedIndex === null}
                value={frequencyToValue(currentParams.frequency)}
                min={0}
                max={1}
                size={DIAL_SIZE}
                onChange={handleFreqChanged}
              />
              <NumberEditLabel
                value={currentParams.frequency}
                min={FREQ_START}
                max={NYQUIST}
                disabled={selectedIndex === null}
                label={`${currentParams.frequency.toFixed(0)} Hz`}
                onChange={f => handleFreqChanged(frequencyToValue(f))}
              />
            </VBox>
            <VBox alignItems="center" id="dial-gain">
              <Dial
                label="Gain"
                disabled={selectedIndex === null || !FILTER_PARAM_MAPPING[currentParams.type].usesGain}
                onZero={() => handleGainChanged(0.0)}
                value={currentParams.gain}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={handleGainChanged}
              />
              <NumberEditLabel
                value={currentParams.gain}
                min={-20}
                max={20}
                disabled={selectedIndex === null || !FILTER_PARAM_MAPPING[currentParams.type].usesGain}
                label={`${currentParams.gain.toFixed(2)} dB`}
                onChange={handleGainChanged}
              />
            </VBox>
            <VBox alignItems="center" id="dial-q">
              <Dial
                label="Q"
                disabled={selectedIndex === null || !FILTER_PARAM_MAPPING[currentParams.type].usesQ}
                onZero={() => handleQChanged(1.0)}
                value={currentParams.q}
                min={0.1}
                max={10}
                size={DIAL_SIZE}
                onChange={handleQChanged}
              />
              <NumberEditLabel
                value={currentParams.q}
                min={0.1}
                max={10}
                disabled={selectedIndex === null || !FILTER_PARAM_MAPPING[currentParams.type].usesQ}
                label={currentParams.q.toFixed(2)}
                onChange={handleQChanged}
              />
            </VBox>
            <VBox alignItems="center" id="dial-preamp">
              <Dial
                label="Preamp"
                onZero={() => handlePreampChanged(0.0)}
                value={preamp}
                min={-20}
                max={20}
                size={DIAL_SIZE}
                onChange={handlePreampChanged}
              />
              <NumberEditLabel
                value={preamp}
                min={-20}
                max={20}
                label={`${preamp.toFixed(2)} dB`}
                onChange={handlePreampChanged}
              />
            </VBox>
            <VBox alignItems="center" id="filter-type">
              <ControlLabel className="themed controlLabel">Filter Type</ControlLabel>
              <AudioIcon glyph={AUDIO_ICON_FILTER_MAP[currentParams.type]} size={24} />
              <VSpacer size={1} />
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
            </VBox>
          </HBox>
          <VBox alignItems="center" id="add-remove">
            <ControlLabel className="themed controlLabel">Add/Remove</ControlLabel>
            <VBox alignItems="center" justifyContent="space-around" flex={1}>
              <IconButton
                glyph="add"
                onClick={() => handleAddFilter()}
                title="Add new filter"
                size={FILTER_ADD_REMOVE_BTN_SIZE}
              />
              <IconButton
                glyph="remove"
                onClick={() => handleRemoveFilter()}
                size={FILTER_ADD_REMOVE_BTN_SIZE}
                title="Remove selected filter"
                disabled={selectedIndex === null}
              />
            </VBox>
          </VBox>
        </HBox>
      </Surface>
    </VBox>
  );
}

export { EqualizerControls };
