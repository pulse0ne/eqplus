import { useEffect, useState } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Logo, VBox } from '../src-common-ui';
import { DEFAULT_THEMES } from '../src-common/defaults';
import { StorageKeys } from '../src-common/storage-keys';
import { FilterParams } from '../src-common/types/filter';
import { Message } from '../src-common/types/messaging';
import { load } from '../src-common/utils/storageUtils';
import equalizer from './eq/equalizer';
import GlobalStyles from './globalStyles';

const tabCapture: () => Promise<MediaStream|null> = () => {
  return new Promise((resolve) => {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream|null) => {
      resolve(stream);
      void chrome.runtime.lastError;
    });
  });
};

chrome.runtime.onMessage.addListener((msg: Message) => {
  switch(msg.type) {
    case 'stopCapture':
      equalizer.disconnectFromStream();
      break;
    case 'addFilter': {
      const filter = msg.payload as FilterParams;
      equalizer.addFilter(filter);
      break;
    }
    case 'removeFilter': {
      const id = msg.payload as string;
      equalizer.removeFilter(id);
      break;
    }
    case 'updateFilter': {
      const filter = msg.payload as FilterParams;
      equalizer.updateFilter(filter.id, filter);
      break;
    }
    case 'updatePreamp': {
      const preampValue = msg.payload as number;
      equalizer.updatePreamp(preampValue);
      break;
    }
    case 'setFilters': {
      const filters = msg.payload as FilterParams[];
      equalizer.setFilters(filters);
      break;
    }
  }
});

const PageWrapper = styled(VBox)`
  height: 100%;
`;

const FancyLink = styled.a`
  color: ${({ theme }) => theme.colors.accentPrimary};
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
    border-radius: 4px;
  }
`;

const Divider = styled.div`
  margin: 32px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  height: 0;
`;

const Explainer = styled.p`
  font-size: 1.5em;
  max-width: 700px;
  text-align: center;
  line-height: 1.75em;
`;

function App () {
  const [ theme, setTheme ] = useState<DefaultTheme>(DEFAULT_THEMES[0]);

  useEffect(() => {
      load(StorageKeys.THEME_STATE, { currentTheme: DEFAULT_THEMES[0] }).then(state => {
        setTheme(state.currentTheme);
      });
  }, []);

  tabCapture().then(stream => stream && equalizer.connectToStream(stream));

  return (
    <ThemeProvider theme={theme}>
      <PageWrapper>
        <VBox alignItems="center">
          <Logo size={128} />
          <h1 style={{ fontSize: '3em' }}>Wait, don&apos;t close this tab!</h1>

          <Explainer>
            This tab needs to stay open for eq+ to work properly. The plugin uses <FancyLink href="https://developer.chrome.com/docs/extensions/reference/tabCapture/" target="_blank" rel="noreferrer">tab capture</FancyLink> in
            order to get the audio stream from the current tab. Unfortunately, in <FancyLink href="https://developer.chrome.com/docs/extensions/mv3/intro/" target="_blank" rel="noreferrer">Manifest V3</FancyLink> the only way
            to capture a tab is to have a destination tab to send the audio to. If Google ever decides to change this in the future, you hopefully won&apos;t have to see this page anymore.
          </Explainer>

          <Divider />

          <p>
            eq+ will always be <FancyLink href="https://github.com/pulse0ne/eqplus" target="_blank" rel="noreferrer">open source</FancyLink>. I welcome feedback and feature requests.
          </p>
          <p>
            - Tyler
          </p>
        </VBox>
      </PageWrapper>
      <GlobalStyles />
    </ThemeProvider>
  );
}

export default App;
