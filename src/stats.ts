import { GRAY, RESET, WHITE } from './util/ansi.js';

export interface TypedStats {
    correctlyTyped: number;
    totalTyped: number;
}

export interface Stats {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    timeSpent: number; // Time spent in seconds
    totalTyped: number;
    correctlyTyped: number;
    errors: number;
}

export function calculateStats(
    typedStats: TypedStats,
    timeInSeconds: number
): Stats {
    const totalTyped = typedStats.totalTyped;
    const correctlyTyped = typedStats.correctlyTyped;

    const wpm = Math.round(correctlyTyped / (5 * (timeInSeconds / 60)));
    const rawWpm = Math.round(totalTyped / (5 * (timeInSeconds / 60)));
    const accuracy =
        totalTyped > 0 ? Math.round((correctlyTyped / totalTyped) * 100) : 0;

    return {
        wpm,
        rawWpm,
        accuracy,
        timeSpent: timeInSeconds,
        totalTyped,
        correctlyTyped,
        errors: totalTyped - correctlyTyped
    };
}

type Row = [string, string | number];

function centerText(text: string, width: number): string {
    const padTotal = width - text.length;
    const padStart = Math.floor(padTotal / 2);
    const padEnd = padTotal - padStart;
    return ' '.repeat(padStart) + text + ' '.repeat(padEnd);
}

function padRight(text: string, width: number): string {
    return text + ' '.repeat(width - text.length);
}

function padLeft(text: string, width: number): string {
    return ' '.repeat(width - text.length) + text;
}

function printCenteredLine(line: string): void {
    const terminalWidth = process.stdout.columns || 80;
    const padding = Math.max(
        0,
        Math.floor(
            (terminalWidth - line.replace(/\x1b\[[0-9;]*m/g, '').length) / 2
        )
    );
    console.log(' '.repeat(padding) + line);
}

function buildCenteredTable(
    title: string,
    rows: Row[],
    totalWidth: number = 40,
    leftColWidth: number = 20
): void {
    const rightColWidth = totalWidth - leftColWidth - 3;

    const borderTop = GRAY + '╔' + '═'.repeat(totalWidth - 2) + '╗' + RESET;
    const borderMid =
        GRAY +
        '╠' +
        '═'.repeat(leftColWidth) +
        '╦' +
        '═'.repeat(rightColWidth) +
        '╣' +
        RESET;
    const borderBottom =
        GRAY +
        '╚' +
        '═'.repeat(leftColWidth) +
        '╩' +
        '═'.repeat(rightColWidth) +
        '╝' +
        RESET;

    printCenteredLine(borderTop);
    printCenteredLine(
        GRAY +
            '║' +
            WHITE +
            centerText(title, totalWidth - 2) +
            GRAY +
            '║' +
            RESET
    );
    printCenteredLine(borderMid);

    for (const [left, right] of rows) {
        const leftPadded = padRight(left, leftColWidth - 2);
        const rightPadded = padLeft(String(right), rightColWidth - 2);
        const line =
            GRAY +
            `║ ${WHITE}${leftPadded}${GRAY} ║ ${WHITE}${rightPadded}${GRAY} ║` +
            RESET;
        printCenteredLine(line);
    }

    printCenteredLine(borderBottom);
}

export function displayTypingStats(stats: Stats): void {
    const rows: Row[] = [
        ['WPM', stats.wpm],
        ['Raw WPM', stats.rawWpm],
        ['Accuracy', `${stats.accuracy}%`],
        ['Time Spent', `${stats.timeSpent}s`]
    ];

    buildCenteredTable('Typing Statistics', rows, 30, 15);
}
