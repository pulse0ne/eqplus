import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { exec } from 'node:child_process';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const watches = ['options', 'background', 'popup'];

const setupListeners = (proc) => {
  proc.stdout.on('data', (data) => console.log(chalk.blue(data.replace('\n', ''))));
  proc.stderr.on('data', (data) => console.error(chalk.red(data.replace('\n', ''))));
  proc.stdout.on('end', () => console.log(chalk.bgGreen('Done.')));
};

watches.forEach(watch => {
  fs.watch(path.join(__dirname, `src-${watch}`), { recursive: true }, () => {
    setupListeners(exec(`yarn build:${watch}`));
  });
});

const buildAll = () => setupListeners(exec('yarn build'));

fs.watch(path.join(__dirname, 'src-common'), { recursive: true }, buildAll);
fs.watch(path.join(__dirname, 'src-common-ui'), { recursive: true }, buildAll);

buildAll();
