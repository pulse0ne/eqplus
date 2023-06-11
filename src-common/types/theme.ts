import { Color } from './color';

export type Transition = React.CSSProperties['transition'];

export type Theme = {
  name: string,
  locked: boolean,
  misc: {
    transition: Transition
  },
  colors: {
    accentPrimary: Color,
    accentSecondary: Color,
    background: Color,
    border: Color,
    controlTrack: Color,
    dialKnob: Color,
    disabled: Color,
    freqResponseLine: Color,
    graphBackground: Color,
    graphLine: Color,
    graphLineMarker: Color,
    graphText: Color,
    surface: Color,
    textPrimary: Color,
    textSecondary: Color
  }
};
