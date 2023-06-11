// export type RGB = `rgb(${number}, ${number}, ${number})`;
// export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
// export type HEX = `#${string}`;
// export type Color = RGB | RGBA | HEX;
// export type Transition = React.CSSProperties['transition'];

// namespace EQPlus {
  // export type Filter = {
  //   id: string,
  //   frequency: number,
  //   gain: number,
  //   q: number,
  //   type: BiquadFilterType
  // };

  // export type Settings = {
  //   sensitivity: number
  // };

  // export type Preset = {
  //   name: string,
  //   locked: boolean,
  //   filters: Filter[],
  //   preampGain: number
  // };

  // export type MessageType = 'updateFilter'|'updatePreamp'|'setEnabled'|'resetFilters'|'savePreset'|'loadPreset'|'deletePreset'|'startCapture';

  // export type Message = {
  //   type: MessageType,
  //   payload?: EQPlus.Filter|number|boolean|EQPlus.Preset|string;
  // };

  // export type Theme = {
  //   name: string,
  //   locked: boolean,
  //   misc: {
  //     transition: Transition
  //   },
  //   colors: {
  //     accentPrimary: Color,
  //     accentSecondary: Color,
  //     background: Color,
  //     border: Color,
  //     controlTrack: Color,
  //     dialKnob: Color,
  //     disabled: Color,
  //     freqResponseLine: Color,
  //     graphBackground: Color,
  //     graphLine: Color,
  //     graphLineMarker: Color,
  //     graphText: Color,
  //     surface: Color,
  //     textPrimary: Color,
  //     textSecondary: Color
  //   }
  // };

  // export type EQState = {
  //   preampValue: number,
  //   filters: Filter[]
  // };

  // export type ThemeState = {
  //   currentTheme: Theme
  // };
// }

export namespace StorageKeys {
  export const EQ_STATE = 'eqplus:state:eq';
  export const THEME_STATE = 'eqplus:state:theme'
  export const PRESETS = 'eqplus:presets';
}
