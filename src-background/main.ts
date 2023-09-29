import debounce from '../src-common/debounce';
import { DEFAULT_STATE, DEFAULT_TAB_INFO } from '../src-common/defaults';
import { StorageKeys } from '../src-common/storage-keys';
import { EQState } from '../src-common/types/equalizer';
import { FilterParams } from '../src-common/types/filter';
import { Message } from '../src-common/types/messaging';
import { TabInfo } from '../src-common/types/tabinfo';
import { load, save, update } from '../src-common/utils/storageUtils';

const saveStateDebounced: (state: EQState) => void = debounce((state: EQState) => {
  save(StorageKeys.EQ_STATE, state);
}, 500);

const loadState = () => load(StorageKeys.EQ_STATE, DEFAULT_STATE);

const handleStartCapture = () => {
  load(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO).then(tabInfo => {
    let ensuredRemoval: Promise<void> = Promise.resolve();
    if (tabInfo.eqPageId) {
      ensuredRemoval = chrome.tabs.remove(tabInfo.eqPageId);
    }
    ensuredRemoval.then(() => {
      chrome.tabs.create({
        pinned: true,
        active: false,
        url: `chrome-extension://${chrome.runtime.id}/options/index.html`
      }).then(tab => {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([capturedTab]) => {
          const tabInfo: TabInfo = {
            capturedTab: capturedTab.id ?? null,
            eqPageId: tab.id ?? null
          };
          save(StorageKeys.TAB_INFO, tabInfo);
        });
      });
    }).catch(e => {
      // we couldn't remove the eq page, maybe it doesn't exist, so blow it away from storage
      save(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO);
      console.log('error: ', e.message);
    });
  });
};

const handleStopCapture = () => {
  load(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO).then(tabInfo => {
    if (tabInfo.eqPageId) {
      chrome.tabs.remove(tabInfo.eqPageId)
        .catch(e => {
          // we couldn't remove the eq page, maybe it doesn't exist, so blow it away from storage so we're not in a weird state
          save(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO);
          console.log('error: ', e.message);
        });
    }
  });
};

const handleUpdateFilter = (updatedFilter: FilterParams) => {
  loadState().then(state => {
    const filterToUpdate = state.filters.find(f => f.id === updatedFilter.id);
    if (filterToUpdate) {
      filterToUpdate.frequency = updatedFilter.frequency;
      filterToUpdate.gain = updatedFilter.gain;
      filterToUpdate.q = updatedFilter.q;
      filterToUpdate.type = updatedFilter.type;
      saveStateDebounced(state);
    }
  });
};

const handleUpdatePreamp = (preampValue: number) => {
  if (Number.isFinite(preampValue)) {
    loadState().then(state => {
      state.preamp = preampValue;
      saveStateDebounced(state);
    });
  }
};

const handleAddFilter = (filter: FilterParams) => {
  loadState().then(state => {
    const newFilters = [...state.filters, filter];
    saveStateDebounced({ ...state, filters: newFilters });
  });
};

const handleRemoveFilter = (id: string) => {
  loadState().then(state => {
    const filterIndex = state.filters.findIndex(f => f.id === id);
    if (filterIndex > -1) {
      state.filters.splice(filterIndex, 1);
      saveStateDebounced(state);
    }
  });
};

const handleSetFilters = (filters: FilterParams[]) => {
  loadState().then(state => {
    state.filters = filters;
    saveStateDebounced(state);
  });
};

const handleUnknown = (msg: Message) => {
  console.error('unknown message type:', msg.type);
};

chrome.runtime.onMessage.addListener((msg: Message) => {
  switch (msg.type) {
    case 'updateFilter':
      handleUpdateFilter(msg.payload as FilterParams);      
      break;
    case 'updatePreamp':
      handleUpdatePreamp(msg.payload as number);
      break;
    case 'addFilter':
      handleAddFilter(msg.payload as FilterParams);
      break;
    case 'removeFilter':
      handleRemoveFilter(msg.payload as string);
      break;
    case 'setFilters':
      handleSetFilters(msg.payload as FilterParams[]);
      break;
    case 'startCapture':
      handleStartCapture();
      break;
    case 'stopCapture':
      handleStopCapture();
      break;
    default:
      handleUnknown(msg);
  }
});

// cleanup on tab closures
chrome.tabs.onRemoved.addListener(closedTabId => {
  update<TabInfo>(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO, (oldInfo) => {
    if (closedTabId === oldInfo.eqPageId) {
      return DEFAULT_TAB_INFO;
    } else if (closedTabId === oldInfo.capturedTab) {
      handleStopCapture();
      return DEFAULT_TAB_INFO;
    } else {
      return oldInfo;
    }
  });
});

/** EXPERIMENTAL **/
chrome.tabs.onActivated.addListener(tabActiveInfo => {
  chrome.tabs.get(tabActiveInfo.tabId)
    .then(tab => {
      // console.log('activated', tab.url);
      if (tab.id) {
        maybeCaptureTab(tab.id);
      }
    });
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.tabs.get(tabId)
    .then(tab => {
      // console.log('updated', tab.url);
      if (tab.id) {
        maybeCaptureTab(tab.id);
      }
    });
});

const getDomain = (rawUrl: string|undefined) => {
  if (!rawUrl) return '';
  const url = new URL(rawUrl);
  return url.hostname;
};

const maybeCaptureTab = async (tabId: number) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    // TODO: load saved domains
    if (tab.active && tab.status === 'complete' && /youtube.com/.test(getDomain(tab.url))) {
      const tabInfo = await load(StorageKeys.TAB_INFO, DEFAULT_TAB_INFO);
      console.log(tabInfo);
      if (!tabInfo.capturedTab && !tabInfo.eqPageId) {
        handleStartCapture();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export { }; // IMPORTANT: keep this
