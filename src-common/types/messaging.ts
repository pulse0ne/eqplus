import { FilterParams } from './filter';

export type MessageType ='updateFilter'
  | 'updatePreamp'
  | 'addFilter'
  | 'removeFilter'
  | 'setFilters'
  | 'startCapture'
  | 'stopCapture';

export type MessagePayload = FilterParams
  | FilterParams[]
  | number
  | boolean
  | string;

export type Message = {
  type: MessageType,
  payload?: MessagePayload
};
