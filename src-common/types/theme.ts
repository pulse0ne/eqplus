import { Color } from './color';

export type Theme = {
  name: string,
  schemaVersion: number,
  locked: boolean,
  colors: {
    accentPrimary: Color,
    accentSecondary: Color,
    background: Color,
    border: Color,
    controlLabel: Color,
    controlTrack: Color,
    dialKnob: Color,
    disabled: Color,
    freqResponseLine: Color,
    graphBackground: Color,
    graphLine: Color,
    graphLineMarker: Color,
    graphText: Color,
    selectBackground: Color,
    selectBorder: Color,
    selectText: Color,
    surface: Color,
    text: Color
  }
};
