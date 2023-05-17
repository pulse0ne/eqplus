const FILTER_PREFIX = 'eqplus:filter:';
const CURRENT_STATE = 'eqplus:state';
const PRESETS = 'eqplus:presets';

const buildFilterKey = (index: number) => `${FILTER_PREFIX}${index}`;

export {
  FILTER_PREFIX,
  CURRENT_STATE,
  PRESETS,
  buildFilterKey
};
