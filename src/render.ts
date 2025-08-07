import { getInitialWords, getRandomWord } from './words';
import { WHITE, GRAY, RED, ORANGE, CLEAR_SCREEN, RESET, BOLD } from './ansi';

const words = getInitialWords();

let currentWordIndex: number = 0;
let currentInput: string = '';
let lockedWords: string[] = [];

export function render(secondsRemaining: number) {
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
                color = correct ? WHITE : RED;
            } else {
                color = isLocked ? ORANGE : GRAY;
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
    const extraLines = isFinite(secondsRemaining) ? 2 : 0;
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
    if (isFinite(secondsRemaining)) {
        const timerText = `⏱ ${secondsRemaining}s`;
        const timerPadding = Math.max(
            0,
            Math.floor((termWidth - timerText.length) / 2)
        );
        const timerSpacer = ' '.repeat(timerPadding);
        process.stdout.write(
            timerSpacer + BOLD + WHITE + timerText + RESET + '\n'
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

function finalizeCurrentWord(onFinish: () => void) {
    if (currentInput.length > 0) {
        lockedWords.push(currentInput);
        currentInput = '';
        currentWordIndex++;

        words.push(getRandomWord());

        // If done with all words
        if (currentWordIndex >= words.length) {
            render(0);
            onFinish();
        }
    }
}

export function handleKeypress(
    chunk: Buffer,
    onFinish: () => void,
    timeRemaining: number
) {
    const key = chunk.toString();

    if (key === '\u0004') {
        // Ctrl+D
        onFinish();
    } else if (key === '\u0003') {
        // Ctrl+C
        onFinish();
    } else if (key === '\u007F') {
        // Backspace
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
        }
    } else if (key === ' ' || key === '\n' || key === '\r') {
        // Space key or Enter key
        finalizeCurrentWord(onFinish);
    } else if (/^[ -~]$/.test(key)) {
        // Regular printable characters
        currentInput += key;
    }

    render(timeRemaining);
}
