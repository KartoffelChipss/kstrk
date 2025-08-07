import ora from 'ora';
import { wordsFilePath } from '../util/paths';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

async function downloadWordsFile(wordsFilePath: string): Promise<void> {
    const url =
        'https://gist.githubusercontent.com/deekayen/4148741/raw/98d35708fa344717d8eee15d11987de6c8e26d7d/1-1000.txt';

    if (!fs.existsSync(wordsFilePath)) {
        fs.mkdirSync(path.dirname(wordsFilePath), { recursive: true });
    }

    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to download file: ${response.statusText}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const nodeStream = new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) this.push(null);
            else this.push(Buffer.from(value));
            this.closed;
        }
    });

    await pipeline(nodeStream, fs.createWriteStream(wordsFilePath));
}

export default async () => {
    const spinner = ora('Downloading words...').start();
    try {
        await downloadWordsFile(wordsFilePath);
        spinner.succeed(`Words file downloaded successfully!`);
        return;
    } catch (error) {
        spinner.fail(
            `Failed to download words file: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exit(1);
    }
};
