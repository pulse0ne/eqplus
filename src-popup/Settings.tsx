import { useCallback, useEffect, useState } from 'react';
import { Button, HBox, Icon, VBox, VSpacer } from '../src-common-ui';
import { ClickableIcon, CloseButton, DialogWrapper } from './Common';
import { load, save } from '../src-common/utils/storageUtils';
import { StorageKeys } from '../src-common/storage-keys';
import styled, { useTheme } from 'styled-components';

const openUserGuide = () => {
  chrome.tabs.create({
    active: true,
    pinned: false,
    url: 'https://github.com/pulse0ne/eqplus/wiki/User-Guide'
  })
};

export type SettingsProps = {
  close: () => void,
  onLaunchTutorial: () => void
};

function Settings({
  close,
  onLaunchTutorial
}: SettingsProps) {
  const [ showResetWarning, setShowResetWarning ] = useState(false);
  const [ captureOnOpen, setCaptureOnOpen ] = useState(false);

  useEffect(() => {
    load(StorageKeys.CAPTURE_ON_OPEN, false).then(setCaptureOnOpen);
  }, []);

  const theme = useTheme();

  const doReset = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'stopCapture' });
    chrome.storage.local.clear();
    window.close();
  }, []);

  const handleCaptureOnOpenToggle = useCallback(() => {
    setCaptureOnOpen(oldVal => {
      const newVal = !oldVal;
      save(StorageKeys.CAPTURE_ON_OPEN, newVal);
      return newVal;
    });
  }, []);

  return (
    <DialogWrapper>
      <HBox alignItems="center" justifyContent="space-between">
        <h3 style={{ padding: 0, margin: 0 }}>Settings</h3>
        <CloseButton glyph="clear" onClick={close} />
      </HBox>

      <VSpacer size={2} />

      <HBox style={{ gap: '8px' }} alignItems="center">
        <span title="Enabling this will start a capture when you open the eq+ popup, without having to push the 'Capture Tab' button">Capture on open:</span>
        <ClickableIcon
          size={32}
          glyph={captureOnOpen ? 'toggle_on' : 'toggle_off'}
          style={{ color: captureOnOpen ? theme.colors.accentPrimary : theme.colors.text }}
          onClick={handleCaptureOnOpenToggle}
        />
      </HBox>

      <VSpacer size={2} />

      {showResetWarning ? (
        <VBox alignItems="center">
          <span style={{ fontSize: '10px', marginBottom: '6px', maxWidth: '100px' }}>Are you <i>absolutely</i> sure you want to reset? This will erase all saved presets and themes.</span>
          <HBox alignItems="center" style={{ gap: '6px' }}>
            <Button onClick={doReset}>Yes</Button>
            <Button onClick={() => setShowResetWarning(false)}>No</Button>
          </HBox>
        </VBox>
      ) : (
        <VBox style={{ gap: '6px' }}>
          <Button onClick={openUserGuide}>User Manual</Button>
          <Button onClick={onLaunchTutorial}>Launch Tutorial</Button>
          <Button onClick={() => setShowResetWarning(true)}>Factory Reset</Button>
        </VBox>
      )}

    </DialogWrapper>
  );
}

export { Settings };
