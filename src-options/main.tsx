import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App';
import { load } from '../src-common/utils/storageUtils';
import { StorageKeys } from '../src-common/storage-keys';
import { DEFAULT_STATE } from '../src-common/defaults';
import './fonts/fonts.css';

load(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
  // equalizer.updatePreamp(state.preampValue);
  // state.filters.forEach(f => equalizer.addFilter(f));
  // console.log(state);

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
});
