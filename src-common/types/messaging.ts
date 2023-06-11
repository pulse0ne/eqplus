import { FilterParams } from './filter';
import { Preset } from './preset';

export type MessageType = 'updateFilter'|'updatePreamp'|'setEnabled'|'resetFilters'|'savePreset'|'loadPreset'|'deletePreset'|'startCapture';

export type Message = {
  type: MessageType,
  payload?: FilterParams|number|boolean|Preset|string;
};
