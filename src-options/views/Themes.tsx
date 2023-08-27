import { useCallback, useState } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { RgbaStringColorPicker } from 'react-colorful';
import Dial from '../../src-common-ui/Dial';
import Checkbox from '../../src-common-ui/Checkbox';
import { DEFAULT_THEMES } from '../../src-common/defaults';
import ViewWrapper from './ViewWrapper';
import { HBox, VBox, VSpacer } from '../../src-common-ui/FlexBox';
import { Button } from '../../src-common-ui/Button';
import { CanvasPlot } from '../../src-common-ui/CanvasPlot';
import { Theme } from '../../src-common/types/theme';
import { Color } from '../../src-common/types/color';
import { IFilter } from '../../src-common/types/filter';
import { FilterNode } from '../eq/filters';
import { AUDIO_CONTEXT } from '../../src-common/audio-constants';
import camelToTitle from '../../src-common/utils/camelToTitle';
import { NativeSelect } from '../../src-common-ui/Choose';

const ColorPicker = styled(RgbaStringColorPicker)`
  & .react-colorful__saturation-pointer {
    width: 16px;
    height: 16px;
    border-radius: 8px;
  }

  & .react-colorful__hue-pointer,
  & .react-colorful__alpha-pointer {
    width: 8px;
    border-radius: 2px;
  }
`;

const WidgetWrapper = styled(HBox)`
  flex-wrap: wrap;
  gap: 16px;
  margin-right: 16px;
`;

const SectionWrapper = styled(VBox)`
  & h2 { margin-bottom: 0; }
`;

const ExampleSurface = styled.div`
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ExampleBorder = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ColorBlurb = styled.small`
  max-width: 200px;
`;

const ControlsContainer = styled(VBox)`
  padding-left: 16px;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
`;

const Swatch = styled.div<{colorKey: ThemeColorKey}>`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, colorKey }) => theme.colors[colorKey]};
`;

// const FancySelect = styled.select`
//   border: 1px solid ${({ theme }) => theme.colors.border};
//   padding: 0.3em;
//   border-radius: 4px;
//   background-color: ${({ theme }) => theme.colors.background};
//   color: ${({ theme }) => theme.colors.textPrimary};
//   min-width: 100px;
//   &:focus {
//     outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
//     outline-offset: -2px;
//   }
// `;

const FancyLabel = styled.span`
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
`;

type LabeledSelectProps = React.HTMLAttributes<HTMLSelectElement> & { label: string };

function LabeledSelect ({ label, ...rest }: LabeledSelectProps) {
  return (
    <VBox>
      <FancyLabel>{label}</FancyLabel>
      <NativeSelect {...rest} />
    </VBox>
  );
}

// const chooseOptions: ChooseOption[] = [
//   { value: 'a', icon: 'eqplus favorite'},
//   { value: 'b', icon: 'eqplus music_note' },
//   { value: 'c', icon: 'eqplus headset' },
//   { value: 'd', icon: 'eqplus speaker' }
// ];

const exampleFilters: IFilter[] = [
  { id: '0', frequency: 128, q: 1.0, type: 'peaking' as BiquadFilterType, gain: 5 },
  { id: '1', frequency: 512, q: 1.0, type: 'peaking' as BiquadFilterType, gain: -2 },
  { id: '2', frequency: 2048, q: 1.0, type: 'peaking' as BiquadFilterType, gain: 10 },
  { id: '3', frequency: 4096, q: 1.0, type: 'peaking' as BiquadFilterType, gain: -5 }
].map(i => FilterNode.fromFilterParams(i, AUDIO_CONTEXT));

type ThemeColorKey = keyof Theme['colors'];

const swatchKeys: ThemeColorKey[] = ['accentPrimary', 'background', 'textPrimary', 'freqResponseLine'];

export type ThemesProps = {
  currentTheme: DefaultTheme,
  themeChanged: (newTheme: DefaultTheme) => void
};

function Themes({
  currentTheme,
  themeChanged
}: ThemesProps) {
  const [ currentKey, setCurrentKey ] = useState<ThemeColorKey>(Object.keys(DEFAULT_THEMES[0].colors)[0] as ThemeColorKey);
  const [ disabled, setDisabled ] = useState(false);
  const [ dialVal, setDialVal ] = useState(25);
  const [ checkboxValue, setCheckboxValue ] = useState(true);
  // const [ chooseValue, setChooseValue ] = useState(chooseOptions[0]);
  const [ swatchHelp, setSwatchHelp ] = useState('');

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const theme = DEFAULT_THEMES.find(t => t.name === e.target.value);
    if (theme) {
      themeChanged({ ...theme });
    }
  }, [currentTheme]);

  const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentKey(e.target.value as ThemeColorKey);
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    themeChanged({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [currentKey as ThemeColorKey]: newColor as Color
      }
    });
  }, [currentKey, currentTheme]);

  const handleSwatchClick = useCallback((swatchKey: ThemeColorKey) => {
    themeChanged({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [currentKey]: currentTheme.colors[swatchKey]
      }
    });
  }, [currentTheme, currentKey]);

  const themeKeys = Object.keys(DEFAULT_THEMES[0].colors);

  return (
    <ViewWrapper>
      <p>This tool allows you to change themes, tweak them, or create your own. Examples of many of the controls and themeable widgets are provided to see what affects changes will have.</p>
      <HBox>
        <WidgetWrapper>
          <SectionWrapper>
            <h2>Equalizer</h2>
            <ColorBlurb><b>Colors:</b> Accent Primary, Disabled, Freq Response Line, Graph Background, Graph Line, Graph Line Marker, Graph Text</ColorBlurb>
            <VSpacer size={2} />
            <CanvasPlot
              filters={exampleFilters}
              activeNodeIndex={0}
              width={400}
              height={200}
              disabled={disabled}
            />
            <small>This equalizer is just an example and read-only.</small>
          </SectionWrapper>

          <SectionWrapper>
            <h2>Dial</h2>
            <ColorBlurb><b>Colors:</b> Accent Primary, Control Track, Dial Knob, Disabled</ColorBlurb>
            <VSpacer size={2} />
            <Dial
              value={dialVal}
              onChange={setDialVal}
              disabled={disabled}
              size={60}
            />
          </SectionWrapper>

          <SectionWrapper>
            <h2>Checkbox</h2>
            <ColorBlurb><b>Colors:</b> Accent Primary, Control Track, Disabled</ColorBlurb>
            <VSpacer size={2} />
            <Checkbox
              checked={checkboxValue}
              onChange={setCheckboxValue}
              disabled={disabled}
            />
          </SectionWrapper>

          <SectionWrapper>
            <h2>Select</h2>
            <ColorBlurb><b>Colors:</b> Accent Primary, Background, Border, Disabled, Text Primary</ColorBlurb>
            <VSpacer size={2} />
            <HBox>
              {/* <Choose
                direction="up"
                options={chooseOptions}
                selected={chooseValue}
                onSelected={setChooseValue}
                disabled={disabled}
              /> */}
              <NativeSelect>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </NativeSelect>
            </HBox>
          </SectionWrapper>

          <SectionWrapper>
            <h2>Surface</h2>
            <ColorBlurb><b>Colors:</b> Surface</ColorBlurb>
            <VSpacer size={2} />
            <ExampleSurface>
              This is text on a surface.
            </ExampleSurface>
          </SectionWrapper>

          <SectionWrapper>
            <h2>Border</h2>
            <ColorBlurb><b>Colors:</b> Border</ColorBlurb>
            <VSpacer size={2} />
            <ExampleBorder>
              This is text inside a border.
            </ExampleBorder>
          </SectionWrapper>
        </WidgetWrapper>

        <ControlsContainer>
          <HBox>
            <LabeledSelect label="Load Theme" onChange={handleThemeChange}>
              {DEFAULT_THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </LabeledSelect>
          </HBox>

          <VSpacer size={4} />
          
          <HBox>
            <LabeledSelect label="Color Key" onChange={handleKeyChange}>
              {themeKeys.map(k => <option key={k} value={k}>{camelToTitle(k)}</option>)}
            </LabeledSelect>
          </HBox>
          
          <VSpacer size={1} />
          
          <ColorPicker color={currentTheme.colors[currentKey as ThemeColorKey]} onChange={handleColorChange} />
          <small>{swatchHelp}&nbsp;</small>
          <HBox justifyContent="space-around">
            {swatchKeys.map(k => (
              <Swatch
                key={k}
                colorKey={k}
                onMouseEnter={() => setSwatchHelp(`Use "${camelToTitle(k)}"`)}
                onMouseLeave={() => setSwatchHelp('')}
                onClick={() => handleSwatchClick(k)}
              />
            ))}
          </HBox>
          
          <VSpacer size={1} style={{ margin: '0 4px' }} />

          {currentTheme.colors[currentKey as ThemeColorKey]} {/* TODO: color input */}
          <Button onClick={() => console.log(JSON.stringify(currentTheme))}>Log</Button>
        </ControlsContainer>

      </HBox>
    </ViewWrapper>
  );
}

export default Themes;
