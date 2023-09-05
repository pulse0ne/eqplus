import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App';
import equalizer from './eq/equalizer';
import './fonts/fonts.css';

// load equalizer settings
equalizer.load();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
