import fs from 'fs';
import path from 'path';
import envPaths from 'env-paths';

const paths = envPaths('kstrk', { suffix: '' });

export const configFilePath = path.join(paths.config, 'config.toml');
fs.mkdirSync(paths.config, { recursive: true });

export const wordsFilePath = path.join(paths.data, 'words.txt');
fs.mkdirSync(paths.data, { recursive: true });
