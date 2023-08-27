const fs = require('fs');
const path = require('path');
const { exec } = require('node:child_process');

const watches = ['options', 'background', 'popup'];

const setupListeners = (proc) => {
  proc.stdout.on('data', (data) => console.log(data.replace('\n', '')));
  proc.stderr.on('data', (data) => console.error(data.replace('\n', '')));
};

watches.forEach(watch => {
  fs.watch(path.join(__dirname, `src-${watch}`), { recursive: true }, () => {
    setupListeners(exec(`yarn build:${watch}`));
  });
});

const buildAll = () => setupListeners(exec('yarn build'));

fs.watch(path.join(__dirname, 'src-common'), { recursive: true }, buildAll);
fs.watch(path.join(__dirname, 'src-common-ui'), { recursive: true }, buildAll);
