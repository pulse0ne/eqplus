import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
import loadStorageValue from './utils/loadStorageValue';
import { StorageKeys } from '../src-common/storage-keys';
import { DEFAULT_EQ_STATE } from '../src-common/defaults';

import './fonts/fonts.css';

loadStorageValue(StorageKeys.EQ_STATE, DEFAULT_EQ_STATE).then(state => {
  // equalizer.updatePreamp(state.preampValue);
  // state.filters.forEach(f => equalizer.addFilter(f));

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
});
