// import { DEFAULT_FILTERS, DEFAULT_PRESETS, DEFAULT_STATE } from '../src-cmn/defaults';
// import { CURRENT_STATE, FILTER_PREFIX, PRESETS, buildFilterKey } from '../src-cmn/storage-keys';

import { Message } from '../src-common/types/messaging';

const DEBUG = true;

const debugErrHandler = (e: Error) => {
  if (DEBUG) {
    console.log(e);
  }
};

// chrome.storage.local.clear();

// chrome.storage.local.get('optionsTabId').then(res => {
//   if (res.optionsTabId) {
//     chrome.tabs.remove(res.optionsTabId).catch(debugErrHandler);
//   }
//   chrome.storage.local.remove('optionsTabId');
// });

// // write missing storage items on startup
// chrome.storage.local.get(null)
//   .then(storage => {
//     if (DEBUG) {
//       console.log(storage);
//     }
//     if (!Object.keys(storage).filter(key => key.startsWith(FILTER_PREFIX)).length) {
//       DEFAULT_FILTERS.forEach(filter => {
//         chrome.storage.local.set({ [buildFilterKey(filter.index)]: filter });
//       });
//     }
//     if (!storage[CURRENT_STATE]) {
//       chrome.storage.local.set({ [CURRENT_STATE]: DEFAULT_STATE });
//     }
//     if (!storage[PRESETS]) {
//       chrome.storage.local.set({ [PRESETS]: DEFAULT_PRESETS });
//     }
//   });

const handleSetEnabled = (enabled: boolean) => {
  // if (enabled) {
  //   chrome.storage.local.get('optionsTabId').then(res => {
  //     if (res.optionsTabId) {
  //       chrome.tabs.remove(res.optionsTabId).catch(debugErrHandler);
  //     }
  //     chrome.tabs.create({
  //       pinned: true,
  //       active: false,
  //       url: `chrome-extension://${chrome.runtime.id}/options/index.html`
  //     }).then(tab => chrome.storage.local.set({ optionsTabId: tab.id }));
  //   });
  // } else {
  //   chrome.storage.local.get('optionsTabId').then(res => {
  //     if (res.optionsTabId) {
  //       chrome.tabs.remove(res.optionsTabId)
  //         .then(() => chrome.storage.local.remove('optionsTabId').catch(debugErrHandler));
  //     }
  //   });
  // }

  // chrome.storage.local.get(CURRENT_STATE).then(res => {
  //   const oldState: EQPlus.State = res[CURRENT_STATE];
  //   chrome.storage.local.set({ [CURRENT_STATE]: { ...oldState, enabled } });
  // });

    chrome.storage.local.get('optionsTabId').then(res => {
      if (!res.optionsTabId) {
        chrome.tabs.create({
          pinned: true,
          active: false,
          url: `chrome-extension://${chrome.runtime.id}/options/index.html`
        }).then(tab => chrome.storage.local.set({ optionsTabId: tab.id }));
      }
    });
};

// const handleSavePreset = (preset: EQPlus.Preset) => {
//   chrome.storage.local.get(PRESETS)
//     .then(res => {
//       if (res[PRESETS]) {
//         const updatedPresets = [...(res[PRESETS] as EQPlus.Preset[]), preset];
//         chrome.storage.local.set({ [PRESETS]: updatedPresets });
//       } else {
//         chrome.storage.local.set({ [PRESETS]: [preset] });
//       }
//     });
// };

// const handleUpdatePreampValue = (value: number) => {
//   chrome.storage.local.get(CURRENT_STATE)
//     .then(res => {
//       const oldState: EQPlus.State = res[CURRENT_STATE];
//       chrome.storage.local.set({ [CURRENT_STATE]: { ...oldState, currentPreampGain: value } });
//     });
// };

// const handleResetFilters = () => {
//   const newFilters = DEFAULT_FILTERS.reduce((acc, filter) => {
//     acc[buildFilterKey(filter.index)] = filter;
//     return acc;
//   }, {} as Record<string, EQPlus.Filter>);
//   chrome.storage.local.set(newFilters);
// };

// const handleLoadPreset = (presetName: string) => {
//   chrome.storage.local.get(PRESETS)
//     .then(res => {
//       const presets: EQPlus.Preset[]|null|undefined = res[PRESETS];
//       if (presets) {
//         const preset = presets.find(p => p.name === presetName);
//         if (preset) {
//           const newFilters = preset.filters.reduce((acc, filter) => {
//             acc[buildFilterKey(filter.index)] = filter;
//             return acc;
//           }, {} as Record<string, EQPlus.Filter>);
//           chrome.storage.local.set(newFilters);
//         }
//       }
//     });
// };

// const handleDeletePreset = (presetName: string) => {
//   chrome.storage.local.get(PRESETS)
//     .then(res => {
//       const presets: EQPlus.Preset[]|null|undefined = res[PRESETS];
//       if (presets) {
//         const presetIndex = presets.findIndex(p => p.name === presetName);
//         if (presetIndex > -1) {
//           presets.splice(presetIndex, 1);
//           chrome.storage.local.set({ [PRESETS]: presets });
//         }
//       }
//     });
// };

chrome.runtime.onMessage.addListener((msg: Message) => {
  switch (msg.type) {
    // case 'updateFilter':
    //   const updatedFilter: EQPlus.Filter = msg.payload as EQPlus.Filter;
    //   const key = buildFilterKey(updatedFilter.index);
    //   chrome.storage.local.set({ [key]: updatedFilter });
    //   break;
    // case 'updatePreamp':
    //   handleUpdatePreampValue(msg.payload as number);
    //   break;
    case 'setEnabled':
      handleSetEnabled(msg.payload as boolean);
      break;
    // case 'resetFilters':
    //   handleResetFilters();
    //   break;
    // case 'savePreset':
    //   handleSavePreset(msg.payload as EQPlus.Preset);
    //   break;
    // case 'loadPreset':
    //   handleLoadPreset(msg.payload as string);
    //   break;
    // case 'deletePreset':
    //   handleDeletePreset(msg.payload as string);
    //   break;
    default:
      if (DEBUG) {
        console.log(msg);
      } else {
        console.error('unknown message type:', msg.type);
      }
  }
});

export {}; // IMPORTANT: keep this
