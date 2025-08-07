const fs = require("fs");

const wordsfile = "words.txt";
if (!fs.existsSync(wordsfile)) {
    console.error(`Error: The file "${wordsfile}" does not exist.`);
}

const wordsContent = fs.readFileSync(wordsfile, "utf8");
const wordsList = wordsContent
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.trim());

const getInitialWords = (count = 15) => {
    return wordsList
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

const getRandomWord = () => wordsList[Math.floor(Math.random() * wordsList.length)];

module.exports = {
    getInitialWords,
    getRandomWord
}