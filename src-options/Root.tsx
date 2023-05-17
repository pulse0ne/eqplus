import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { DEFAULT_THEMES } from '../src-common/defaults';
import Themes from './views/Themes';
import GlobalStyles from './utils/globalStyles';
import { HBox, VBox } from './components/FlexBox';
import NavItem from './components/NavItem';
import Logo from './components/Logo';
import About from './views/About';
import EqualizerControls from './views/EqualizerControls';
import Presets from './views/Presets';
import Settings from './views/Settings';
import equalizer from './eq/equalizer';
import EQPlus from '../src-common/types';
import debounce from '../src-common/debounce';

const tabCapture: () => Promise<MediaStream> = () => {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream|null) => {
      stream ? resolve(stream) : reject('stream is null');
    });
  });
};

const saveThemeDebounced = debounce((theme: EQPlus.Theme) => {
  chrome.storage.local.set({ [EQPlus.Keys.THEME_STATE]: { currentTheme: theme } });
}, 500);

const PageWrapper = styled(VBox)`
  height: 100%;
`;

const Split = styled(HBox)`
  flex: 1;
`;

const HeaderWrapper = styled(HBox)`
  margin-bottom: 8px;
`;

const Navigation = styled(VBox)`
  height: 100%;
  padding: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.misc.boxShadow};
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 4px 32px;
`;

const navItems = [
  { path: '/', label: 'Equalizer', glyph: 'tune' },
  { path: '/presets', label: 'Presets', glyph: 'star' },
  { path: '/themes', label: 'Themes', glyph: 'invert_colors_on' },
  { path: '/settings', label: 'Settings', glyph: 'settings' },
  { path: '/about', label: 'About', glyph: 'help_outline' }
];

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'startCapture') {
    console.log('start capture');
    tabCapture().then(stream => {
      equalizer.connect([], stream);
    });
  } else if (msg.type === 'stopCapture') {
    console.log('stop capture');
    equalizer.destroy();
  }
});

function Root () {
  const [ theme, setTheme ] = useState<DefaultTheme>(DEFAULT_THEMES[0]);

  useEffect(() => {
    const key = EQPlus.Keys.THEME_STATE;
    chrome.storage.local.get(key)
      .then(res => {
        const state = res[key] as EQPlus.ThemeState|null;
        if (state) {
          setTheme(state.currentTheme);
        }
      })
  }, []);

  useEffect(() => saveThemeDebounced(theme), [theme]);

  return (
    <HashRouter>
      <ThemeProvider theme={theme}>
        <PageWrapper>
          <Split>
            <Navigation>
              <HeaderWrapper justifyContent="center">
                <Logo size={64} fill={theme.colors.textPrimary} />
              </HeaderWrapper>
              {navItems.map(i => (
                <NavItem
                  key={i.path}
                  path={i.path}
                  label={i.label}
                  glyph={i.glyph}
                />
              ))}
            </Navigation>
            <ContentWrapper>
              <Routes>
                <Route path="/" element={<EqualizerControls />} />
                <Route path="/presets" element={<Presets />} />
                <Route path="/themes" element={<Themes currentTheme={theme} themeChanged={(newTheme) => setTheme(newTheme)}/>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </ContentWrapper>
          </Split>
        </PageWrapper>
        <GlobalStyles />
      </ThemeProvider>
    </HashRouter>
  );
}

export default Root;
