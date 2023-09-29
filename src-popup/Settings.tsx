import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, HBox, HSpacer, Icon, VBox, VSpacer } from '../src-common-ui';
import { exportPresets, importPreset } from '../src-common/import-export/preset';
import { StorageKeys } from '../src-common/storage-keys';
import { FilterParams } from '../src-common/types/filter';
import { Preset } from '../src-common/types/preset';
import { load, update } from '../src-common/utils/storageUtils';
import { TextOverflowClip } from './Common';
import { Toast, ToastProps } from './Toast';

const ScrollBox = styled.div`
  height: 200px;
  width: 200px;
  max-width: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Wrapper = styled(VBox)`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  z-index: 9999;
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const InlineInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  padding: 2px;
  font-size: 11px;
`;

const InlineButton = styled(Button)`
  padding: 2px 6px;
  font-size: 11px;
`;

const ClickableIcon = styled(Icon)`
  cursor: pointer;
`;

const CloseButton = styled(ClickableIcon)`
  &:hover {
    color: red;
  }
`;

export type SettingsProps = {
  currentState: { filters: FilterParams[], preamp: number },
  close: () => void,
  onLoadPreset: (preset: Preset) => void,
  onLaunchTutorial: () => void
};

function Settings({
  currentState,
  close,
  onLoadPreset,
  onLaunchTutorial
}: SettingsProps) {
  const [ savedPresets, setSavedPresets ] = useState<Preset[]>([]);
  const [ isSavingPreset, setIsSavingPreset ] = useState(false);
  const [ newPresetName, setNewPresetName ] = useState('');
  const [ showToast, setShowToast ] = useState(false);
  const [ toastInfo, setToastInfo ] = useState<Omit<ToastProps, 'onClose'>>({ messages: [], glyph: '' });
  const [ editingPreset, setEditingPreset ] = useState<Preset|null>(null);
  const [ showResetWarning, setShowResetWarning ] = useState(false);
  
  const inputFileRef = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    load(StorageKeys.PRESETS, []).then(setSavedPresets);
  }, []);

  const handleDeletePreset = useCallback((preset: Preset) => {
    setSavedPresets(oldPresets => oldPresets.filter(p => p.name !== preset.name));
    update<Preset[]>(StorageKeys.PRESETS, [], oldPresets => oldPresets.filter(p => p.name !== preset.name));
  }, []);

  const handlePresetNameInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewPresetName(e.target.value);
  }, []);

  const savePreset = useCallback(() => {
    update<Preset[]>(StorageKeys.PRESETS, [], oldPresets => {
      const newPreset: Preset = {
        filters: currentState.filters,
        preampGain: currentState.preamp,
        locked: false,
        name: newPresetName
      };
      return [...oldPresets, newPreset];
    }).then(setSavedPresets)
    .finally(() => {
      setNewPresetName('');
      setIsSavingPreset(false);
    });
  }, [currentState, newPresetName]);

  const saveNameChange = useCallback(() => {
    if (!editingPreset) return;
    update<Preset[]>(StorageKeys.PRESETS, [], existing => {
      const target = existing.find(e => e.name === editingPreset.name);
      if (!target) return existing;
      target.name = newPresetName;
      return [...existing];
    }).then(setSavedPresets)
    .finally(() => {
      setNewPresetName('');
      setEditingPreset(null);
    });
  }, [newPresetName, editingPreset]);

  const isNameValid = useMemo(() => {
    return Boolean(newPresetName) && !savedPresets.some(p => p.name.toLowerCase() === newPresetName.toLowerCase());
  }, [newPresetName, savedPresets]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      importPreset(e.target.files[0])
        .then(results => {
          if (results.softErrors.length) {
            setToastInfo({ messages: ['Imported preset with the following warnings:', ...results.softErrors.map(e => `• ${e}`)], glyph: 'info_outline' });
          } else {
            setToastInfo({ messages: ['Successfully imported preset'], glyph: 'done' });
          }
          setSavedPresets([...savedPresets, results.preset]);
        })
        .catch(e => setToastInfo({ messages: [`Failed to import preset: ${e.message}`], glyph: 'error_outline' }))
        .finally(() => setShowToast(true));
    }
  }, [savedPresets]);

  const handleStartRenamingPreset = useCallback((preset: Preset) => {
    setNewPresetName(preset.name);
    setEditingPreset(preset);
  }, []);

  const handleCancelRenamingPreset = useCallback(() => {
    setNewPresetName('');
    setEditingPreset(null);
  }, []);

  const handleImportClicked = useCallback(() => {
    inputFileRef.current?.click();
  }, []);

  const doReset = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'stopCapture' });
    chrome.storage.local.clear();
    window.close();
  }, []);

  return (
    <>
      <Wrapper>
        <HBox alignItems="center" justifyContent="space-between">
          <h3 style={{ padding: 0, margin: 0 }}>Presets</h3>
          <CloseButton glyph="clear" onClick={close} />
        </HBox>

        <VSpacer size={2} />

        <VBox>
          {isSavingPreset ? (
            <HBox>
              <input placeholder="Preset name" value={newPresetName} onChange={handlePresetNameInput} />
              <Button disabled={!isNameValid} onClick={savePreset}>Save</Button>
            </HBox>
          ) : (
            <Button onClick={() => setIsSavingPreset(true)}>New Preset</Button>
          )}
        </VBox>

        <VSpacer size={1} />

        <span style={{ fontSize: '10px' }}>PRESETS</span>
        <ScrollBox>
          {savedPresets.map(p => (
            <HBox
              key={p.name}
              style={{ padding: '6px 12px' }}
              justifyContent="space-between"
              alignItems="center"
            >
            {(editingPreset && editingPreset.name === p.name) ? (
              <HBox alignItems="center">
                <InlineInput value={newPresetName} onChange={handlePresetNameInput} />
                <InlineButton disabled={!isNameValid} onClick={saveNameChange}>Save</InlineButton>
                <InlineButton onClick={handleCancelRenamingPreset}>Cancel</InlineButton>
              </HBox>
            ) : (
              <>
                <TextOverflowClip>{p.name}</TextOverflowClip>
                <HBox alignItems="center">
                  <ClickableIcon glyph="create" onClick={() => handleStartRenamingPreset(p)} />
                  <HSpacer size={1} />
                  <ClickableIcon glyph="launch" onClick={() => onLoadPreset(p)} />
                  <HSpacer size={1} />
                  <ClickableIcon glyph="clear" onClick={() => handleDeletePreset(p)} />
                </HBox>
              </>
            )}
            </HBox>
          ))}
        </ScrollBox>
        <VSpacer size={1} />
        <HBox justifyContent="center" style={{ gap: '6px' }}>
          <Button onClick={() => exportPresets()} disabled={!savedPresets.length}>Export</Button>
          <input
            ref={inputFileRef}
            type="file"
            accept=".txt"
            onChange={handleFileInputChange}
            style={{ display: 'none'}}
          />
          <Button onClick={handleImportClicked}>Import</Button>
        </HBox>

        <VSpacer size={1} />

        {showResetWarning ? (
          <VBox alignItems="center">
            <span style={{ fontSize: '10px' }}>Are you <i>absolutely</i> sure?</span>
            <HBox alignItems="center" style={{ gap: '6px' }}>
              <Button onClick={doReset}>Yes</Button>
              <Button onClick={() => setShowResetWarning(false)}>No</Button>
            </HBox>
          </VBox>
        ) : (
          <HBox alignItems="center" justifyContent="center" style={{ gap: '6px' }}>
            <Button onClick={onLaunchTutorial}>Tutorial</Button>
            <Button onClick={() => setShowResetWarning(true)}>Factory Reset</Button>
          </HBox>
        )}

      </Wrapper>
      {showToast && (
        <Toast
          messages={toastInfo.messages}
          glyph={toastInfo.glyph}
          onClose={() => setShowToast(false)}
          timeoutMs={toastInfo.glyph !== 'done' ? 10000 : 5000}
        />
      )}
    </>
  );
}

export { Settings };
