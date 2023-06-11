import ViewWrapper from './ViewWrapper';
import importPreset from '../importers/preset';
import exportPreset from '../exporters/preset';

const testPreset = `
# test comment
Preamp: -6.0 dB
Filter 1: ON PK Fc 50.0 Hz Gain 8.4 dB Q 0.671
Filter 2: ON PK Fc 100.0 Hz Gain 8.4 dB Q 0.671
Filter 3: ON PK Fc 1000.0 Hz Gain 8.4 dB Q 0.671
Filter 4: ON PK Fc 4000.0 Hz Gain 8.4 dB Q 0.671
Filter 5: ON PK Fc 10000.0 Hz Gain 8.4 dB Q 0.671
Filter 6: ON PK Fc 20000.0 Hz Gain 8.4 dB Q 0.671
`;

const blob = new Blob([testPreset], { type: 'text/plain' });
importPreset(blob)
  .then(resp => {
    console.log(resp);
    const b = exportPreset(resp.preset);
    b.text().then(r => console.log(r));
  })
  .catch(e => {
    console.log(`[ERROR]: ${(e as Error).message}`);
  });

function Presets () {
  return (
    <ViewWrapper>
      Presets
    </ViewWrapper>
  );
}

export default Presets;
