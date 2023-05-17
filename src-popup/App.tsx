function App() {
  const start = () => {
    chrome.runtime.sendMessage({ type: 'startCapture' });
  };
  const open = () => {
    chrome.runtime.sendMessage({ type: 'setEnabled', payload: true });
  };
  const stop = () => {
    chrome.runtime.sendMessage({ type: 'stopCapture' });
  };
  const reset = () => {
    chrome.storage.local.clear();
  };

  return (
    <div style={{ padding: '12px' }}>
      <button onClick={open}>Open</button>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
