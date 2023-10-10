import { useCallback, useEffect, useMemo, useState } from 'react';
import { DefaultTheme, ThemeProvider } from 'styled-components';
import { Button, EqualizerControls, HBox, IconButton, VBox } from '../src-common-ui';
import debounce from '../src-common/debounce';
import { DEFAULT_SETTINGS, DEFAULT_STATE, DEFAULT_TAB_INFO, DEFAULT_THEMES } from '../src-common/defaults';
import { StorageKeys } from '../src-common/storage-keys';
import { FilterChanges, FilterParams } from '../src-common/types/filter';
import { MessagePayload, MessageType } from '../src-common/types/messaging';
import { Preset } from '../src-common/types/preset';
import { TabInfo } from '../src-common/types/tabinfo';
import { Theme } from '../src-common/types/theme';
import isDefined from '../src-common/utils/isDefined';
import { load, save } from '../src-common/utils/storageUtils';
import throttle from '../src-common/utils/throttle';
import { truncate } from '../src-common/utils/truncate';
import uuid from '../src-common/utils/uuid';
import { Settings } from './Settings';
import { ThemeBuilder } from './ThemeBuilder';
import { Tutorial } from './Tutorial';
import GlobalStyles from './globalStyles';
import { Presets } from './Presets';
import { UserSettings } from '../src-common/types/settings';

const sendMessage = (type: MessageType, payload?: MessagePayload) => {
  chrome.runtime.sendMessage({ type, payload });
};

const sendThrottledMessage: (type: MessageType, payload?: MessagePayload) => void = throttle((type: MessageType, payload: MessagePayload|undefined) => {
  sendMessage(type, payload);
}, 100);

const saveThemeDebounced = debounce((theme: Theme) => {
  save(StorageKeys.THEME_STATE, { currentTheme: theme });
}, 500);

const start = () => sendMessage('startCapture');
const stop = () => sendMessage('stopCapture');

const getCurrentTab = () => chrome.tabs.query({ active: true, currentWindow: true })
  .then(tabs => tabs.length ? tabs[0] : null);

const isTabCapturable = (currentTab: chrome.tabs.Tab|null) => currentTab && currentTab.url && !currentTab.url.startsWith('chrome');

function App() {
  const [ theme, setTheme ] = useState<DefaultTheme>(DEFAULT_THEMES[0]);
  const [ filters, setFilters ] = useState<FilterParams[]>([]);
  const [ preamp, setPreamp ] = useState(1.0);
  const [ showThemeBuilder, setShowThemeBuilder ] = useState(false);
  const [ showSettings, setShowSettings ] = useState(false);
  const [ showPresets, setShowPresets ] = useState(false);
  const [ currentTab, setCurrentTab ] = useState<chrome.tabs.Tab|null>(null);
  const [ capturedTab, setCapturedTab ] = useState<chrome.tabs.Tab|null>(null);
  const [ tabInfo, setTabInfo ] = useState(DEFAULT_TAB_INFO);
  const [ showTutorial, setShowTutorial ] = useState(false);
  const [ settings, setSettings ] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    load(StorageKeys.THEME_STATE, { currentTheme: DEFAULT_THEMES[0] }).then(state => {
      setTheme(state.currentTheme);
    });
    load(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
      setFilters(state.filters);
      setPreamp(state.preamp);
    });
    load(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO).then((tabInfo) => {
      setTabInfo(tabInfo);
      if (!tabInfo.capturedTab) {
        load(StorageKeys.SETTINGS, DEFAULT_SETTINGS).then(settings => {
          setSettings(settings);
          if (settings.captureOnOpen) {
            getCurrentTab().then(currentTab => {
              if (isTabCapturable(currentTab)) {
                start();
              }
            });
          }
        });
      }
    });
    getCurrentTab().then(setCurrentTab);

    load(StorageKeys.TUTORIAL_SEEN, false).then(val => setShowTutorial(!val));

    // set listener for tab changes
    chrome.storage.local.onChanged.addListener(changes => {
      if (changes[StorageKeys.TAB_INFO] && changes[StorageKeys.TAB_INFO].newValue) {
        setTabInfo(changes[StorageKeys.TAB_INFO].newValue as TabInfo);
        getCurrentTab().then(setCurrentTab);
      }
    });
  }, []);

  useEffect(() => saveThemeDebounced(theme), [theme]);

  useEffect(() => {
    if (tabInfo.capturedTab) {
      chrome.tabs.get(tabInfo.capturedTab, tab => setCapturedTab(tab));
    } else {
      setCapturedTab(null);
    }
  }, [tabInfo]);

  const isCapturableTab = useMemo(() => isTabCapturable(currentTab), [currentTab]);

  const handleFilterChanged = useCallback((index: number, { frequency, gain, q, type }: FilterChanges) => {
    const filter = filters[index];
    if (isDefined(frequency)) filter.frequency = frequency;
    if (isDefined(gain)) filter.gain = gain;
    if (isDefined(q)) filter.q = q;
    if (isDefined(type)) filter.type = type;
    setFilters([...filters]);
    sendThrottledMessage('updateFilter', filter);
  }, [filters]);

  const handleAddFilter = useCallback((frequency: number) => {
    const newFilter: FilterParams = { id: uuid(), frequency, gain: 0.0, q: 1.0, type: 'peaking' };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    sendMessage('addFilter', newFilter);
  }, [filters]);

  const handleRemoveFilter = useCallback((index: number) => {
    const newFilters = [...filters];
    const [ removed ] = newFilters.splice(index, 1);
    setFilters(newFilters);
    sendMessage('removeFilter', removed.id);
  }, [filters]);

  const handlePreampChanged = useCallback((value: number) => {
    sendMessage('updatePreamp', value);
    setPreamp(value);
  }, []);

  const handleLoadPreset = useCallback((preset: Preset) => {
    setFilters(preset.filters);
    handlePreampChanged(preset.preampGain);
    sendMessage('setFilters', preset.filters);
  }, []);

  const handleLaunchTutorial = useCallback(() => {
    setShowSettings(false);
    setShowTutorial(true);
  }, []);

  const handleTutorialFinished = useCallback(() => {
    save(StorageKeys.TUTORIAL_SEEN, true);
    setShowTutorial(false);
  }, []);

  const handleSettingsChanged = useCallback((newSettings: UserSettings) => {
    save(StorageKeys.SETTINGS, newSettings);
    setSettings(newSettings);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <VBox alignItems="center" style={{ padding: '6px', height: '100%' }}>
        <EqualizerControls
          filters={filters}
          preamp={preamp}
          drawCompositeResponse={settings.drawCompositeResponse}
          onFilterAdded={handleAddFilter}
          onFilterChanged={handleFilterChanged}
          onFilterRemoved={handleRemoveFilter}
          onPreampChanged={handlePreampChanged}
        />
        <VBox flex={1} alignItems="center">
          <HBox alignItems="center" style={{ gap: '6px' }} flex={1}>
            {capturedTab?.favIconUrl && <img src={capturedTab?.favIconUrl} width={20} height={20} />}
            <span>{truncate(capturedTab?.title, 72)}</span>
          </HBox>
          <HBox alignItems="center" style={{ gap: '6px' }} flex={1}>
            {tabInfo.capturedTab ? (
              <Button onClick={stop} id="eq-tab">Stop Equalizing</Button>
             ) : (
              <Button onClick={start} disabled={!isCapturableTab} id="eq-tab">Equalize Tab</Button>
            )}
          </HBox>
        </VBox>
      </VBox>

      <HBox style={{ position: 'absolute', right: 12, bottom: 12, gap: 6 }} id="settings-themes">
        <IconButton glyph="tune" onClick={() => setShowPresets(true)} size={20} />
        <IconButton glyph="settings" onClick={() => setShowSettings(true)} size={20} />
        <IconButton glyph="brush" onClick={() => setShowThemeBuilder(true)} size={20} />
      </HBox>

      {showThemeBuilder && (
        <ThemeBuilder
          currentTheme={theme}
          themeChanged={setTheme}
          close={() => setShowThemeBuilder(false)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onSettingsChanged={handleSettingsChanged}
          close={() => setShowSettings(false)}
          onLaunchTutorial={handleLaunchTutorial}
        />
      )}

      {showPresets && (
        <Presets
          currentState={{ filters, preamp }}
          onLoadPreset={handleLoadPreset}
          close={() => setShowPresets(false)}
        />
      )}

      {showTutorial && <Tutorial onDone={handleTutorialFinished} />}

      <GlobalStyles />
    </ThemeProvider>
  );
}

export default App;
