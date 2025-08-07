import fs from 'fs';
import { wordsFilePath } from './util/paths';
import { RED } from './util/ansi';

const fetchWordsList = (): string[] => {
    if (!fs.existsSync(wordsFilePath)) {
        console.error(
            `${RED}Words file not found at "${wordsFilePath}"\nEither download your own or run the following command to download a word list automatically: \n\n${RED}kstrk --download-words\n`
        );
        process.exit(1);
    }

    const wordsContent = fs.readFileSync(wordsFilePath, 'utf8');
    return wordsContent
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) => word.trim());
};

export const getInitialWords = (count: number = 50): string[] => {
    return fetchWordsList()
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
};

export const getRandomWord = (): string => {
    const wordsList = fetchWordsList();
    return wordsList[Math.floor(Math.random() * wordsList.length)];
};
