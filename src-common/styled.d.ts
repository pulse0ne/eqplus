import 'styled-components';
import EQPlus from './types';

declare module 'styled-components' {
  export interface DefaultTheme extends EQPlus.Theme {}
}
