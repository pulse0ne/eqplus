import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App';
// import loadStorageValue from './utils/loadStorageValue';
// import { DEFAULT_STATE } from '../src-common/defaults';
// import equalizer from './eq/equalizer';

import './fonts/fonts.css';

// loadStorageValue(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
  // equalizer.updatePreamp(state.preampValue);
  // state.filters.forEach(f => equalizer.addFilter(f));

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
// });
