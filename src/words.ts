import fs from 'fs';

const wordsfile = 'words.txt';
if (!fs.existsSync(wordsfile)) {
    console.error(`Error: The file "${wordsfile}" does not exist.`);
}

const wordsContent = fs.readFileSync(wordsfile, 'utf8');
const wordsList = wordsContent
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.trim());

export const getInitialWords = (count: number = 50): string[] => {
    return wordsList.sort(() => Math.random() - 0.5).slice(0, count);
};

export const getRandomWord = (): string =>
    wordsList[Math.floor(Math.random() * wordsList.length)];
