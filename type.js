const { getInitialWords, getRandomWord } = require("./words");

const words = getInitialWords();

let currentWordIndex = 0;
let currentInput = "";
let lockedWords = [];

const RESET = "\x1b[0m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";
const ORANGE = "\x1b[33m";
const GREEN = "\x1b[32m";
const CLEAR = "\x1b[2J\x1b[H";

function render() {
    const termWidth = process.stdout.columns || 80;
    process.stdout.write(CLEAR);

    let output = "";
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
                if (isLocked) color = ORANGE;
                else color = GRAY;
            }

            wordOutput += color + char;
        }

        const totalWordLength = targetWord.length + 1; // +1 for space

        // Word wrapping
        if (charCount + totalWordLength > termWidth) {
            output += "\n";
            row += 1;
            charCount = 0;
        }

        // Cursor position logic
        if (!foundCursor && i === currentWordIndex) {
            // Typing inside this word
            cursorRow = row;
            cursorCol = charCount + currentInput.length + 1;
            foundCursor = true;
        }

        output += wordOutput + " ";
        charCount += totalWordLength;
    }

    process.stdout.write(output + RESET);

    // Move cursor to correct row/col
    process.stdout.write(`\x1b[${cursorRow};${cursorCol}H`);
}

function finalizeCurrentWord() {
    if (currentInput.length > 0) {
        lockedWords.push(currentInput);
        currentInput = "";
        currentWordIndex++;

        // add another word
        words.push(getRandomWord());

        // If done with all words
        if (currentWordIndex >= words.length) {
            render();
            process.stdout.write(GREEN + "\n\n-> Done!\n");
            process.exit();
        }
    }
}

function handleKeypress(chunk) {
    const key = chunk.toString();


    if (key === "\u0004") {
        // Ctrl+D
        process.stdout.write(GREEN + "\n\n-> Done!\n");
        process.exit();
    } else if (key === "\u0003") {
        // Ctrl+C
        process.exit();
    } else if (key === "\u007F") {
        // Backspace
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
        }
    } else if (key === " " || key === "\n" || key === "\r") {
        // Space key or Enter key
        finalizeCurrentWord();
    } else if (/^[ -~]$/.test(key)) {
        // Regular printable characters
        currentInput += key;
    }

    render();
}

function init() {
    process.stdout.write(CLEAR);
    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", handleKeypress);
}

init();
