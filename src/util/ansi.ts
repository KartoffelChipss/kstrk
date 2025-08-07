export const RESET = '\x1b[0m';
export const WHITE = '\x1b[37m';
export const GRAY = '\x1b[90m';
export const RED = '\x1b[31m';
export const ORANGE = '\x1b[33m';
export const GREEN = '\x1b[32m';
export const BLACK = '\x1b[30m';
export const YELLOW = ORANGE;
export const BLUE = '\x1b[34m';
export const MAGENTA = '\x1b[35m';
export const CYAN = '\x1b[36m';
export const CLEAR_SCREEN = '\x1b[2J\x1b[H';
export const BOLD = '\x1b[1m';
export const BEEP = '\x07';

export const nameToAnsi = (name: string): string => {
    switch (name.toLowerCase()) {
        case 'reset':
            return RESET;
        case 'white':
            return WHITE;
        case 'grey':
        case 'gray':
            return GRAY;
        case 'red':
            return RED;
        case 'orange':
            return ORANGE;
        case 'green':
            return GREEN;
        case 'black':
            return BLACK;
        case 'yellow':
            return YELLOW;
        case 'blue':
            return BLUE;
        case 'magenta':
            return MAGENTA;
        case 'cyan':
            return CYAN;
        default:
            throw new Error(`Unknown ANSI color name: ${name}`);
    }
};
