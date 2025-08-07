import { Command } from 'commander';
import helpConfig from './util/helpConfig.js';
import { startGame } from './game.js';
import downloadWords from './extraoptions/downloadWords.js';
import { configFilePath } from './util/paths.js';

const VERSION = '1.0.0';

const program = new Command();

program
    .name('kstrk')
    .version(VERSION)
    .action(() => program.help())
    .configureHelp(helpConfig)
    .option('-t, --time <time>', 'Set the max time in seconds', parseInt)
    .option(
        '-i --infinite',
        'Run indefinitely until interrupted (Ctrl+D or Ctrl+C)'
    )
    .option('--download-words', 'Download a words file automatically')
    .option('--config', 'Show the configuration file path')
    .action(async (): Promise<void> => {
        const opts = program.opts();
        if (opts.downloadWords) return downloadWords();
        if (opts.config) {
            process.stdout.write(configFilePath + '\n');
            return;
        }

        startGame(program);
    });

program.parse(process.argv);
