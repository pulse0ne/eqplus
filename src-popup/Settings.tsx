import { useCallback, useState } from 'react';
import { Button, HBox, VBox, VSpacer } from '../src-common-ui';
import { CloseButton, DialogWrapper } from './Common';

export type SettingsProps = {
  close: () => void,
  onLaunchTutorial: () => void
};

function Settings({
  close,
  onLaunchTutorial
}: SettingsProps) {
  const [ showResetWarning, setShowResetWarning ] = useState(false);

  const doReset = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'stopCapture' });
    chrome.storage.local.clear();
    window.close();
  }, []);

  return (
    <DialogWrapper>
      <HBox alignItems="center" justifyContent="space-between">
        <h3 style={{ padding: 0, margin: 0 }}>Settings</h3>
        <CloseButton glyph="clear" onClick={close} />
      </HBox>

      <VSpacer size={2} />

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

    </DialogWrapper>
  );
}

export { Settings };
