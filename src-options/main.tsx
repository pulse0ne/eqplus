import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
import loadStorageValue from './utils/loadStorageValue';
import { DEFAULT_STATE } from '../src-common/defaults';
import EQPlus from '../src-common/types';
import equalizer from './eq/equalizer';

import './fonts/fonts.css';

loadStorageValue(EQPlus.Keys.EQ_STATE, DEFAULT_STATE).then(state => {
  equalizer.updatePreamp(state.preampValue);
  state.filters.forEach(f => equalizer.addFilter(f));

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
});
