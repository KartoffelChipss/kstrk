import fs from 'fs';
import path from 'path';
import envPaths from 'env-paths';
import { DEFAULT_CONFIG_CONTENT } from './config.js';

const paths = envPaths('kstrk', { suffix: '' });

export const configFilePath = path.join(paths.config, 'config.toml');
fs.mkdirSync(paths.config, { recursive: true });
if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, DEFAULT_CONFIG_CONTENT, { flag: 'wx' });
}

export const wordsFilePath = path.join(paths.data, 'words.txt');
fs.mkdirSync(paths.data, { recursive: true });
