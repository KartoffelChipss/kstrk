import { getInitialWords, getRandomWord } from './words';
import {
    WHITE,
    GRAY,
    RED,
    ORANGE,
    CLEAR_SCREEN,
    RESET,
    BOLD,
    nameToAnsi
} from './util/ansi';
import { TypedStats } from './statsCollector';
import { parseConfig } from './util/config';

const words: string[] = [];

let currentWordIndex: number = 0;
let currentInput: string = '';
let lockedWords: string[] = [];

export function render(secondsRemaining: number) {
    if (words.length === 0) words.push(...getInitialWords());

    const config = parseConfig();

    const termWidth = process.stdout.columns || 80;
    const termHeight = process.stdout.rows || 24;
    process.stdout.write(CLEAR_SCREEN);

    let lines: string[] = [];
    let currentLine = '';
    let charCount = 0;
    let row = 1;
    let cursorRow = 1;
    let cursorCol = 1;
    let foundCursor = false;

    // Build the word lines
    for (let i = 0; i < words.length; i++) {
        const targetWord = words[i];
        const isLocked = i < lockedWords.length;
        const userInput = isLocked
            ? lockedWords[i]
            : i === currentWordIndex
              ? currentInput
              : '';

        let wordOutput = '';
        for (let j = 0; j < targetWord.length; j++) {
            const char = targetWord[j];
            let color;

            if (j < userInput.length) {
                const correct = userInput[j] === char;
                color = correct
                    ? nameToAnsi(config.text.correct_color)
                    : nameToAnsi(config.text.incorrect_color);
            } else {
                color = isLocked
                    ? nameToAnsi(config.text.skipped_color)
                    : nameToAnsi(config.text.text_color);
            }

            wordOutput += color + char;
        }

        const totalWordLength = targetWord.length + 1;

        if (charCount + totalWordLength > termWidth) {
            lines.push(currentLine.trimEnd());
            currentLine = '';
            charCount = 0;
            row++;
        }

        if (!foundCursor && i === currentWordIndex) {
            const preWordLength = charCount;
            cursorRow = row;
            cursorCol = preWordLength + currentInput.length + 1;
            foundCursor = true;
        }

        currentLine += wordOutput + ' ';
        charCount += totalWordLength;
    }

    if (currentLine) {
        lines.push(currentLine.trimEnd());
    }

    // Only show 3 lines around the cursor
    const startLine = Math.max(0, cursorRow - 2);
    const displayLines = lines.slice(startLine, startLine + 3);

    // Total block height: 3 lines + (optional 2 lines for timer)
    const extraLines =
        isFinite(secondsRemaining) && config.timer.show_timer ? 2 : 0;
    const totalBlockLines = displayLines.length + extraLines;

    const verticalPadding = Math.max(
        0,
        Math.floor((termHeight - totalBlockLines) / 2)
    );

    // Output vertical padding
    for (let i = 0; i < verticalPadding; i++) {
        process.stdout.write('\n');
    }

    // Render the timer if not Infinity
    if (isFinite(secondsRemaining) && config.timer.show_timer) {
        const timerText = `${config.timer.timer_icon} ${secondsRemaining}s`;
        const timerPadding = Math.max(
            0,
            Math.floor((termWidth - timerText.length) / 2)
        );
        const timerSpacer = ' '.repeat(timerPadding);
        process.stdout.write(
            timerSpacer +
                BOLD +
                nameToAnsi(config.timer.timer_color) +
                timerText +
                RESET +
                '\n'
        );

        // Blank line after timer
        process.stdout.write('\n');
    }

    // Render the 3 centered lines of words
    displayLines.forEach((line) => {
        const visibleLineLength = line.replace(/\x1b\[[0-9;]*m/g, '').length;
        const padding = Math.max(
            0,
            Math.floor((termWidth - visibleLineLength) / 2)
        );
        const spacer = ' '.repeat(padding);
        process.stdout.write(spacer + line + '\n');
    });

    // Move the cursor to correct position within this vertically centered block
    const relativeCursorRow = cursorRow - startLine;
    const cursorLine = displayLines[relativeCursorRow - 1] || '';
    const visibleLineLength = cursorLine.replace(/\x1b\[[0-9;]*m/g, '').length;
    const horizontalPadding = Math.max(
        0,
        Math.floor((termWidth - visibleLineLength) / 2)
    );

    const finalCursorRow = verticalPadding + extraLines + relativeCursorRow;
    const finalCursorCol = horizontalPadding + cursorCol;

    process.stdout.write(`\x1b[${finalCursorRow};${finalCursorCol}H`);
}

export function calculateTypedStats(): TypedStats {
    let correctlyTyped = 0;
    let totalTyped = 0;

    // Only consider words up to and including the current word index
    for (let i = 0; i <= currentWordIndex && i < words.length; i++) {
        const targetWord = words[i];
        const userWord =
            i < lockedWords.length
                ? lockedWords[i]
                : i === currentWordIndex
                  ? currentInput
                  : '';

        for (let j = 0; j < targetWord.length; j++) {
            totalTyped++; // Count every target character of typed or current word

            if (userWord[j] === targetWord[j]) {
                correctlyTyped++;
            }
        }
    }

    return { correctlyTyped, totalTyped };
}

function finalizeCurrentWord(onFinish: (typedStats: TypedStats) => void) {
    if (currentInput.length > 0) {
        lockedWords.push(currentInput);
        currentInput = '';
        currentWordIndex++;

        words.push(getRandomWord());

        // If done with all words
        if (currentWordIndex >= words.length) {
            render(0);
            onFinish(calculateTypedStats());
        }
    }
}

export function handleKeypress(
    chunk: Buffer,
    onFinish: (typedStats: TypedStats) => void,
    timeRemaining: number,
    startTimer?: () => void // new optional callback
) {
    const key = chunk.toString();

    // Start timer on first printable keypress
    if (startTimer && /^[ -~]$/.test(key)) {
        startTimer();
    }

    if (key === '\u0004') {
        // Ctrl+D
        onFinish(calculateTypedStats());
    } else if (key === '\u0003') {
        // Ctrl+C
        onFinish(calculateTypedStats());
    } else if (key === '\u007F') {
        // Backspace
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
        }
    } else if (key === ' ' || key === '\n' || key === '\r') {
        // Space or Enter key
        finalizeCurrentWord(onFinish);
    } else if (/^[ -~]$/.test(key)) {
        // Regular printable characters
        currentInput += key;
    }

    render(timeRemaining);
}
