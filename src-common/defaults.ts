import EQPlus from './types';

const DEFAULT_FILTERS: EQPlus.Filter[] = [48, 225, 1067, 5060].map(f => {
  return { id: `default-${f}`, frequency: f, gain: 0.0, q: 1.0, type: 'peaking' };
});

const DEFAULT_PRESETS: EQPlus.Preset[] = [
  {
    name: 'Flat',
    icon: 'audiotrack',
    locked: true,
    preampGain: 1.0,
    filters: DEFAULT_FILTERS
  }
];

const BASE_THEME_MISC: EQPlus.Theme['misc'] = {
  transition: '0.3s cubic-bezier(0, 0, 0.24, 1)',
  boxShadow: '0 2px 3px rgba(0, 0, 0, .13), 1px 2px 2px rgba(0, 0, 0, .1), -1px -2px 2px rgba(0, 0, 0, .05)'
};

const DEFAULT_THEMES: EQPlus.Theme[] = [
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

const DEFAULT_STATE: EQPlus.EQState = {
  filters: DEFAULT_FILTERS,
  preampValue: 1.0
};

export {
  DEFAULT_FILTERS,
  DEFAULT_PRESETS,
  DEFAULT_STATE,
  DEFAULT_THEMES
}
