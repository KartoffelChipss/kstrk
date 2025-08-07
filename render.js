const { getInitialWords, getRandomWord } = require("./words");
const {
    WHITE,
    GRAY,
    RED,
    ORANGE,
    GREEN,
    CLEAR,
    RESET
} = require("./ansi");

const words = getInitialWords();

let currentWordIndex = 0;
let currentInput = "";
let lockedWords = [];

function render() {
    const termWidth = process.stdout.columns || 80;
    const termHeight = process.stdout.rows || 24;
    process.stdout.write(CLEAR);

    let lines = [];
    let currentLine = "";
    let charCount = 0;
    let row = 1;
    let cursorRow = 1;
    let cursorCol = 1;
    let foundCursor = false;

    for (let i = 0; i < words.length; i++) {
        const targetWord = words[i];
        const isLocked = i < lockedWords.length;
        const userInput = isLocked
            ? lockedWords[i]
            : i === currentWordIndex
                ? currentInput
                : "";

        let wordOutput = "";
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

        const totalWordLength = targetWord.length + 1; // +1 for space

        if (charCount + totalWordLength > termWidth) {
            lines.push(currentLine.trimEnd());
            currentLine = "";
            charCount = 0;
            row++;
        }

        // Record cursor position
        if (!foundCursor && i === currentWordIndex) {
            const preWordLength = charCount;
            cursorRow = row;
            cursorCol = preWordLength + currentInput.length + 1;
            foundCursor = true;
        }

        currentLine += wordOutput + " ";
        charCount += totalWordLength;
    }

    if (currentLine) {
        lines.push(currentLine.trimEnd());
    }

    // Keep only the 3 lines around the cursorRow
    const startLine = Math.max(0, cursorRow - 2);
    const displayLines = lines.slice(startLine, startLine + 3);

    // Compute vertical padding to center the 3 lines
    const totalLines = displayLines.length;
    const verticalPadding = Math.max(0, Math.floor((termHeight - totalLines) / 2));

    // Blank lines before to center vertically
    for (let i = 0; i < verticalPadding; i++) {
        process.stdout.write("\n");
    }

    // Render centered lines
    displayLines.forEach((line, index) => {
        const visibleLineLength = line.replace(/\x1b\[[0-9;]*m/g, "").length;
        const padding = Math.max(0, Math.floor((termWidth - visibleLineLength) / 2));
        const spacer = " ".repeat(padding);
        process.stdout.write(spacer + line + "\n");
    });

    // Move cursor to correct position, adjusted for vertical and horizontal centering
    const relativeCursorRow = cursorRow - startLine;
    const cursorLine = displayLines[relativeCursorRow - 1] || "";
    const visibleLineLength = cursorLine.replace(/\x1b\[[0-9;]*m/g, "").length;
    const horizontalPadding = Math.max(0, Math.floor((termWidth - visibleLineLength) / 2));
    const finalCursorRow = verticalPadding + relativeCursorRow;
    const finalCursorCol = horizontalPadding + cursorCol;

    process.stdout.write(`\x1b[${finalCursorRow};${finalCursorCol}H`);
}

function finalizeCurrentWord(onFinish) {
    if (currentInput.length > 0) {
        lockedWords.push(currentInput);
        currentInput = "";
        currentWordIndex++;

        // add another word
        words.push(getRandomWord());

        // If done with all words
        if (currentWordIndex >= words.length) {
            render();
            onFinish();
        }
    }
}

function handleKeypress(chunk, onFinish) {
    const key = chunk.toString();


    if (key === "\u0004") {
        // Ctrl+D
        onFinish();
    } else if (key === "\u0003") {
        // Ctrl+C
        onFinish();
    } else if (key === "\u007F") {
        // Backspace
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
        }
    } else if (key === " " || key === "\n" || key === "\r") {
        // Space key or Enter key
        finalizeCurrentWord(onFinish);
    } else if (/^[ -~]$/.test(key)) {
        // Regular printable characters
        currentInput += key;
    }

    render();
}

module.exports = {
    render,
    handleKeypress,
};
