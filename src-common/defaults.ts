import { EqualizerState } from './types/equalizer';
import { FilterParams } from "./types/filter";
import { Preset } from "./types/preset";
import { Theme } from "./types/theme";

const DEFAULT_FILTERS: FilterParams[] = [48, 225, 1067, 5060].map(f => {
  return { id: `default-${f}`, frequency: f, gain: 0.0, q: 1.0, type: 'peaking' };
});

const DEFAULT_PRESETS: Preset[] = [
  {
    name: 'Flat',
    locked: true,
    preampGain: 0.0,
    filters: DEFAULT_FILTERS
  }
];

const BASE_THEME_MISC: Theme['misc'] = {
  transition: '0.3s cubic-bezier(0, 0, 0.24, 1)'
};

const DEFAULT_THEMES: Theme[] = [
  {
    name: 'Default',
    locked: true,
    misc: BASE_THEME_MISC,
    colors: {
      accentPrimary: 'rgba(255, 195, 14, 1.0)',
      accentSecondary: 'rgba(255, 255, 255, 0.9)',
      background: 'rgba(24, 25, 26, 1.0)',
      border: 'rgba(255, 255, 255, 0.7)',
      controlTrack: 'rgba(85, 89, 92, 1.0)',
      disabled: 'rgba(180, 180, 180, 1.0)',
      dialKnob: 'rgba(24, 25, 26, 1.0)',
      freqResponseLine: 'rgba(9, 182, 240, 1.0)',
      graphBackground: 'rgba(35, 36, 39, 1)',
      graphLine: 'rgba(64, 64, 64, 1.0)',
      graphLineMarker: 'rgba(92, 92, 92, 1.0)',
      graphText: 'rgba(128, 128, 128, 1.0)',
      surface: 'rgba(55, 56, 57, 1.0)',
      textPrimary: 'rgba(254, 254, 254, 1.0)',
      textSecondary: 'rgba(239, 239, 239, 1.0)'
    }
  },
  {
    name: 'Barbie',
    locked: false,
    misc: BASE_THEME_MISC,
    colors: {
      accentPrimary: 'rgba(229, 141, 232, 1)',
      accentSecondary: 'rgba(154, 157, 159, 1)',
      background: 'rgba(255, 255, 255, 1)',
      border: 'rgba(115, 44, 122, 0.53)',
      controlTrack: 'rgba(86, 20, 80, 0.13)',
      disabled: 'rgba(180, 180, 180, 1.0)',
      dialKnob: 'rgba(23, 24, 26, 0)',
      freqResponseLine: 'rgba(232, 109, 133, 1)',
      graphBackground: 'rgba(0, 0, 0, 0.04)',
      graphLine: 'rgba(144, 54, 144, 0.24)',
      graphLineMarker: 'rgba(175, 48, 164, 0.54)',
      graphText: 'rgba(128, 128, 128, 1.0)',
      surface: 'rgba(0, 0, 0, 0.05)',
      textPrimary: 'rgba(96, 88, 97, 1)',
      textSecondary: 'rgba(239, 239, 239, 1.0)'
    }
  }
];

const DEFAULT_EQ_STATE: EqualizerState = {
  filters: DEFAULT_FILTERS,
  preamp: 0.0
};

export {
  DEFAULT_FILTERS,
  DEFAULT_PRESETS,
  DEFAULT_EQ_STATE,
  DEFAULT_THEMES
}
