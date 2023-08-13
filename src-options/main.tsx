import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App';
import loadStorageValue from '../src-common/utils/loadStorageValue';
import { StorageKeys } from '../src-common/storage-keys';
import { DEFAULT_STATE } from '../src-common/defaults';
import './fonts/fonts.css';

loadStorageValue(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
  // equalizer.updatePreamp(state.preampValue);
  // state.filters.forEach(f => equalizer.addFilter(f));
  console.log(state);

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
});
