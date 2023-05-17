// import { useCallback, useEffect, useMemo, useState } from 'react';
// import clsx from 'clsx';
// import Checkbox from './components/Checkbox';
// import Choose, { ChooseOption } from './components/Choose';
// import Dial from './components/Dial';
// import NumberEditLabel from './components/NumberEditLabel';
// import CanvasPlot from './components/CanvasPlot';
// import EQPlus from '../src-cmn/types';
// import throttle from '../src-cmn/throttle';
// import { FREQ_START, NYQUIST } from '../src-cmn/audio-constants';
// import { DEFAULT_FILTERS, DEFAULT_PRESETS } from '../src-cmn/defaults';
// import { CURRENT_STATE, FILTER_PREFIX, PRESETS } from '../src-cmn/storage-keys';
// import SavePresetModal from './components/modals/SavePresetModal';
// import PresetsModal from './components/modals/PresetsModal';
// import SettingsModal from './components/modals/SettingsModal';

// import './App.css';

// type FilterOption = {
//   icon: string,
//   value: BiquadFilterType,
//   title: string,
//   qEnabled: boolean,
//   gainEnabled: boolean
// };

// const opts: FilterOption[] = [
//   { icon: 'eq8 highpass small', value: 'highpass', title: 'High Pass', qEnabled: false, gainEnabled: false },
//   { icon: 'eq8 lowshelf small', value: 'lowshelf', title: 'Low Shelf', qEnabled: false, gainEnabled: true },
//   { icon: 'eq8 peaking small', value: 'peaking', title: 'Peaking', qEnabled: true, gainEnabled: true },
//   { icon: 'eq8 notch small', value: 'notch', title: 'Notch', qEnabled: true, gainEnabled: false },
//   { icon: 'eq8 highshelf small', value: 'highshelf', title: 'High Shelf', qEnabled: false, gainEnabled: true },
//   { icon: 'eq8 lowpass small', value: 'lowpass', title: 'Low Pass', qEnabled: false, gainEnabled: false }
// ];

// const filterTypeForFilter = (filter: EQPlus.Filter) => opts.find(o => o.value === filter.type)!;
// const toFixed = (value: number) => value.toFixed(2);
// const frequencyToValue = (value: number) => (Math.log10(value / NYQUIST) / Math.log10(NYQUIST / FREQ_START)) + 1;

// const sendRuntimeMessage: (msg: EQPlus.Message) => void = throttle((msg: EQPlus.Message) => {
//   chrome.runtime.sendMessage(msg);
// }, 50);

// const copyFilters = (inFilters: EQPlus.Filter[]) => {
//   return JSON.parse(JSON.stringify(inFilters)) as EQPlus.Filter[];
// };

// const fallbackFilters = () => copyFilters(DEFAULT_FILTERS);

// function App () {
//   const [ eqEnabled, setEqEnabled ] = useState(false);
//   const [ filters, setFilters ] = useState<EQPlus.Filter[]>(fallbackFilters());
//   const [ selectedFilter, setSelectedFilter ] = useState<EQPlus.Filter|null>(null);
//   const [ sens, setSens ] = useState(2048);
//   const [ savePresetModalOpen, setSavePresetModalOpen ] = useState(false);
//   const [ presetsModalOpen, setPresetsModalOpen ] = useState(false);
//   const [ settingsModalOpen, setSettingsModalOpen ] = useState(false);
//   const [ preampMultiplier, setPreampMultipler ] = useState(1.0);
//   const [ presets, setPresets ] = useState<EQPlus.Preset[]>(DEFAULT_PRESETS);

//   useEffect(() => {
//     chrome.storage.local.get(null)
//       .then(storage => {
//         const filters: EQPlus.Filter[] = [];
//         const presets: EQPlus.Preset[] = [];
//         const storageKeys = Object.keys(storage).sort();
//         storageKeys.forEach(key => {
//           if (key.startsWith(FILTER_PREFIX)) {
//             filters.push(storage[key] as EQPlus.Filter);
//           } else if (key === PRESETS) {
//             presets.push(...(storage[key] as EQPlus.Preset[]));
//           } else if (key === CURRENT_STATE) {
//             const savedState = storage[key] as EQPlus.State;
//             setEqEnabled(savedState.enabled);
//             setPreampMultipler(savedState.currentPreampGain);
//           }
//         });
//         if (filters.length) setFilters(filters);
//         if (presets.length) setPresets(presets);
//       });
//   }, []);

//   // Computed values
//   const fixedFrequency = selectedFilter?.frequency ?? FREQ_START;
//   const freqValue = frequencyToValue(selectedFilter?.frequency ?? FREQ_START);
//   const gainValue = selectedFilter?.gain ?? 0;
//   const qValue = selectedFilter?.q ?? 1.0;
//   const freqDisabled = !eqEnabled;
//   const gainDisabled = !eqEnabled || !selectedFilter || !filterTypeForFilter(selectedFilter).gainEnabled;
//   const qDisabled = !eqEnabled || !selectedFilter || !filterTypeForFilter(selectedFilter).qEnabled;
//   const freqLabel = useMemo(() => {
//     const f = fixedFrequency;
//     return f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${f.toFixed(2)} Hz`;
//   }, [fixedFrequency]);

//   // Handlers
//   const freqDialHandler = useCallback((value: number) => {
//     const filter = filters[selectedFilter?.index ?? -1];
//     if (filter) {
//       const o = Math.log10(NYQUIST / FREQ_START);
//       const f = NYQUIST * Math.pow(10, o * (value - 1));

//       const updatedFilter = { ...filter, frequency: f };
//       sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//       filter.frequency = f;
//       setFilters([...filters]);
//     }
//   }, [selectedFilter, filters]);

//   const freqInputHandler = useCallback((value: number) => {
//     const filter = filters[selectedFilter?.index ?? -1];
//     if (filter) {
//       const updatedFilter = { ...filter, frequency: value };
//       sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//       filter.frequency = value;
//       setFilters([...filters]);
//     }
//   }, [selectedFilter, filters]);

//   const gainDialHandler = useCallback((newGain: number) => {
//     const filter = filters[selectedFilter?.index ?? -1];
//     if (filter) {
//       const updatedFilter = { ...filter, gain: newGain };
//       sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//       filter.gain = newGain;
//       setFilters([...filters]);
//     }
//   }, [selectedFilter, filters]);

//   const qDialHandler = useCallback((value: number) => {
//     const filter = filters[selectedFilter?.index ?? -1];
//     if (filter) {
//       const updatedFilter = { ...filter, q: value };
//       sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//       filter.q = value;
//       setFilters([...filters]);
//     }
//   }, [selectedFilter, filters]);

//   const filterChangedHandler = useCallback((changes: { frequency?: number, gain?: number, q?: number }) => {
//     const filter = filters[selectedFilter?.index ?? -1];
//     if (filter) {
//       const updatedFilter = {
//         ...filter,
//         frequency: changes.frequency ?? filter.frequency,
//         gain: changes.gain ?? filter.gain,
//         q: changes.q ?? filter.q
//       };
//       sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//       if (changes.frequency) filter.frequency = changes.frequency;
//       if (changes.gain) filter.gain = changes.gain;
//       if (changes.q) filter.q = changes.q;
//       setFilters([...filters]);
//     }
//   }, [selectedFilter, filters]);

//   const handleSelected = useCallback((index: number) => {
//     setSelectedFilter(filters[index]);
//   }, [filters]);

//   const selectFilter = useCallback((filter: EQPlus.Filter) => {
//     if (eqEnabled && filter.enabled) {
//       setSelectedFilter(filter);
//     }
//   }, [eqEnabled]);

//   const handleLoadPreset = useCallback((presetName: string) => {
//     const preset = presets.find(p => p.name === presetName);
//     if (preset) {
//       setSelectedFilter(null);
//       sendRuntimeMessage({ type: 'loadPreset', payload: preset.name });
//       console.log(preset.filters);
//       setFilters(copyFilters(preset.filters));
//       setPreampMultipler(preset.preampGain);
//       setPresetsModalOpen(false);
//     }
//   }, [presets]);

//   const handlePresetDeleted = useCallback((presetName: string) => {
//     sendRuntimeMessage({ type: 'deletePreset', payload: presetName });
//     setPresets(oldVal => {
//       const ix = oldVal.findIndex(p => p.name === presetName);
//       oldVal.splice(ix, 1);
//       return [...oldVal];
//     });
//   }, []);

//   const handlePresetSaved = useCallback((name: string, icon: EQPlus.PresetIcon) => {
//     const newPreset = {
//       name,
//       icon,
//       filters: copyFilters(filters),
//       preampGain: preampMultiplier,
//       locked: false
//     };
//     sendRuntimeMessage({ type: 'savePreset', payload: newPreset });
//     setPresets(oldVal => {
//       oldVal.push(newPreset);
//       return [...oldVal];
//     });
//     setSavePresetModalOpen(false);
//   }, [presets, filters, preampMultiplier]);

//   const changeFilterType = useCallback((filter: EQPlus.Filter, opt: ChooseOption) => {
//     const q = opt.value.endsWith('pass') ? 0.0 : 1.0;
//     const gain = 0.0;
//     const updatedFilter = { ...filter, type: opt.value as BiquadFilterType, gain, q };
//     sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//     const f = filters[filter.index];
//     f.q = q;
//     f.gain = gain;
//     f.type = opt.value as BiquadFilterType;
//     setFilters([...filters]);
//   }, [filters]);

//   const handleReset = useCallback(() => {
//     sendRuntimeMessage({ type: 'resetFilters' });
//     setFilters(fallbackFilters());
//     setSelectedFilter(null);
//   }, []);
  
//   const toggleFilterEnabled = useCallback((filter: EQPlus.Filter) => {
//     console.log(filters);
//     const enabled = !filter.enabled;
//     const updatedFilter = { ...filter, enabled };
//     sendRuntimeMessage({ type: 'updateFilter', payload: updatedFilter });
//     filter.enabled = enabled;
//     setFilters([...filters]);
//   }, [filters]);

//   const preampDialHandler = useCallback((value: number) => {
//     sendRuntimeMessage({ type: 'updatePreamp', payload: value });
//     setPreampMultipler(value);
//   }, []); // TODO: deps?
  
//   const toggleMasterEnabled = useCallback(() => {
//     const enabled = !eqEnabled;
//     sendRuntimeMessage({
//       type: 'setEnabled',
//       payload: enabled
//     });
//     setEqEnabled(enabled);
//   }, [eqEnabled]);

//   return (
//     <div id="app">
//       <div className="row">
//         <div className="col align-center section dial-section">
//           <div className="col align-center dial-wrapper">
//             <div className="dial-label">Freq</div>
//             <Dial
//               value={freqValue}
//               min={0}
//               max={1}
//               disabled={freqDisabled}
//               sensitivity={sens}
//               onChange={freqDialHandler}
//             />
//             <NumberEditLabel
//               value={fixedFrequency}
//               label={freqLabel}
//               min={10}
//               max={NYQUIST}
//               disabled={freqDisabled}
//               onChange={freqInputHandler}
//             />
//           </div>
//           <div className="col align-center dial-wrapper">
//             <div className="dial-label">Gain</div>
//             <div
//               onClick={() => !gainDisabled && gainDialHandler(0)}
//               className={clsx({ zeroer: true, disabled: gainDisabled })}
//             >
//               <i className="eq8 arrow_drop_down zeroer"></i>
//             </div>
//             <Dial
//               value={gainValue}
//               min={-20}
//               max={20}
//               disabled={gainDisabled}
//               sensitivity={sens}
//               onChange={gainDialHandler}
//             />
//             <NumberEditLabel
//               value={gainValue}
//               label={`${toFixed(gainValue)} dB`}
//               min={-20}
//               max={20}
//               disabled={gainDisabled}
//               onChange={gainDialHandler}
//             />
//           </div>
//           <div className="col align-center dial-wrapper">
//             <div className="dial-label">Q</div>
//             <Dial
//               value={qValue}
//               min={0}
//               max={10}
//               disabled={qDisabled}
//               sensitivity={sens}
//               onChange={qDialHandler}
//             />
//             <NumberEditLabel
//               value={qValue}
//               label={toFixed(qValue)}
//               min={0}
//               max={10}
//               disabled={qDisabled}
//               onChange={qDialHandler}
//             />
//           </div>
//         </div>
//         <div className="col">
//           <CanvasPlot
//             disabled={!eqEnabled}
//             filters={filters}
//             activeNode={selectedFilter?.index}
//             wheelSensitivity={sens}
//             onHandleSelected={handleSelected}
//             onFilterChanged={filterChangedHandler}
//           />
//           <div className="grow row">
//             {filters.map(f => (
//               <div
//                 key={f.index}
//                 className={clsx({
//                   section: true,
//                   grow: true,
//                   col: true,
//                   'align-center': true,
//                   'justify-center': true,
//                   selected: selectedFilter && f.index === selectedFilter.index,
//                   selectable: eqEnabled && f.enabled
//                 })}
//                 onClick={() => selectFilter(f)}
//               >
//                 <Choose
//                   options={opts}
//                   selected={filterTypeForFilter(f)}
//                   disabled={!eqEnabled}
//                   direction="up"
//                   onSelected={(value) => changeFilterType(f, value)}
//                 />
//                 <div className="grow row align-center justify-end">
//                   <Checkbox
//                     checked={f.enabled}
//                     disabled={!eqEnabled}
//                     onChange={() => toggleFilterEnabled(f)}
//                   />
//                   <span className="no-select">{f.index + 1}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="col section justify-space-between">
//           <div className="col align-center mb3">
//             <div className="master-enable" onClick={toggleMasterEnabled} title="Enable/Disable">
//               <i className={clsx({ eq8: true, power_settings_new: true, enabled: eqEnabled })}></i>
//             </div>
//           </div>
//           <div className="col grow justify-center align-center hover-text" onClick={() => setSavePresetModalOpen(true)}>
//             <i className="eq8 save setting-btn" title="Save as Preset"></i>
//             <span>Save Preset</span>
//           </div>
//           <div className="col grow justify-center align-center hover-text" onClick={() => setPresetsModalOpen(true)}>
//             <i className="eq8 tune setting-btn" title="Presets"></i>
//             <span>Presets</span>
//           </div>
//           <div className="col grow justify-center align-center hover-text" onClick={handleReset}>
//             <i className="eq8 refresh setting-btn" title="Reset"></i>
//             <span>Reset</span>
//           </div>
//           <div className="col grow justify-center align-center hover-text" onClick={() => setSettingsModalOpen(true)}>
//             <i className="eq8 settings setting-btn" title="Options"></i>
//             <span>Options</span>
//           </div>
//           <div className="col align-center my2">
//             <div className="dial-label">Preamp</div>
//             <div
//               className={clsx({ zeroer: true, disabled: !eqEnabled })}
//               onClick={() => preampDialHandler(1.0)}
//             >
//               <i className="eq8 arrow_drop_down zeroer"></i>
//             </div>
//             <Dial
//               value={preampMultiplier}
//               min={0}
//               max={2}
//               disabled={!eqEnabled}
//               sensitivity={sens}
//               onChange={preampDialHandler}
//             />
//             <NumberEditLabel
//               value={preampMultiplier}
//               label={toFixed(preampMultiplier)}
//               min={0}
//               max={2}
//               disabled={!eqEnabled}
//               onChange={preampDialHandler}
//             />
//           </div>
//         </div>
//       </div>
//       {savePresetModalOpen && <SavePresetModal presets={presets} onClose={() => setSavePresetModalOpen(false)} onSave={handlePresetSaved} />}
//       {presetsModalOpen && <PresetsModal presets={presets} onClose={() => setPresetsModalOpen(false)} onDeletePreset={handlePresetDeleted} onLoadPreset={handleLoadPreset} />}
//       {settingsModalOpen && <SettingsModal />}{/* TODO */}
//       {!eqEnabled && <div className="enable-hint">Press the button to EQ this tab &rarr;</div>}
//     </div>
//   );
// }
// 
// export default App;

export default () => {};
