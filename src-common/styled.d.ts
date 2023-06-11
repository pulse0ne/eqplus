import 'styled-components';
import { Theme } from './types/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
