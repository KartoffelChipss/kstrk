import toml from 'toml';
import fs from 'fs';
import { configFilePath } from './paths.js';

export const DEFAULT_CONFIG_CONTENT = `[general]
# Set the default seconds for the game
default_seconds = 60
# Set the file name for the words list
words_file = "words.txt"

[text]
# Colors for the game output
# Possible colors: black, red, green, yellow, blue, magenta, cyan, white, grey
text_color = "grey"
correct_color = "white"
incorrect_color = "red"
skipped_color = "yellow"

[timer]
# Configuration for the timer display
show_timer = true
timer_icon = "⏱"
# Possible colors: black, red, green, yellow, blue, magenta, cyan, white, grey
timer_color = "white"
`;

export interface Config {
    general: {
        default_seconds: number;
        words_file: string;
    };
    text: {
        text_color: string;
        correct_color: string;
        incorrect_color: string;
        skipped_color: string;
    };
    timer: {
        show_timer: boolean;
        timer_icon: string;
        timer_color: string;
    };
}

const deepMerge = (base: any, override: any): any => {
    const result: any = { ...base };
    for (const key of Object.keys(override)) {
        if (
            typeof base[key] === 'object' &&
            base[key] !== null &&
            !Array.isArray(base[key])
        ) {
            result[key] = deepMerge(base[key], override[key] || {});
        } else {
            result[key] = override[key];
        }
    }
    return result;
};

export const parseConfig = (): Config => {
    try {
        const defaultConfig = toml.parse(DEFAULT_CONFIG_CONTENT) as Config;

        if (!fs.existsSync(configFilePath)) {
            console.warn('Config file not found, using default configuration.');
            return defaultConfig;
        }

        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        const userConfig = toml.parse(configContent);

        const mergedConfig = deepMerge(defaultConfig, userConfig);

        return mergedConfig;
    } catch (error) {
        console.error('Failed to parse config:', error);
        throw error;
    }
};
