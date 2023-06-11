import EQPlus from '../../src-common/types';

function filterToApoLine(filter: EQPlus.Filter, index: number): string {
  const tokens = [`Filter ${index + 1}:`, 'ON'];
  const [ fc, gain, q ] = [ filter.frequency.toFixed(0), filter.gain.toFixed(1), filter.q.toFixed(3) ];
  switch (filter.type) {
    case 'allpass':
      tokens.push(`AP Fc ${fc} Hz Q ${q}`);
      break;
    case 'bandpass':
      tokens.push(`BP Fc ${fc} Hz Q ${q}`);
      break;
    case 'highpass':
      tokens.push(`HPQ Fc ${fc} Hz Q ${q}`);
      break;
    case 'highshelf':
      tokens.push(`HSC Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
    case 'lowpass':
      tokens.push(`LPQ Fc ${fc} Hz Q ${q}`);
      break;
    case 'lowshelf':
      tokens.push(`LSC Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
    case 'notch':
      tokens.push(`NO Fc ${fc} Hz Q ${q}`);
      break;
    case 'peaking':
      tokens.push(`PK Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
  }
  return tokens.join(' ');
}

function exportPreset(preset: EQPlus.Preset): Blob {
  const lines = [
    '# This preset was exported from eq+',
    `# [VERSION] : ${chrome.runtime.getManifest().version}`,
    `# [NAME]    : ${preset.name}`,
    `# [DATE]    : ${new Date().toISOString()}`
  ];

  lines.push(`Preamp: ${preset.preampGain.toFixed(1)} dB`);
  preset.filters.forEach((filter, ix) => lines.push(filterToApoLine(filter, ix)));

  return new Blob([lines.join('\n')], { type: 'text/plain' });
}

export default exportPreset;
