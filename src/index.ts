import { render, handleKeypress } from './render';
import { CLEAR_SCREEN, GREEN } from './ansi';
import { Command } from 'commander';
import helpConfig from './util/helpConfig';

const VERSION = '1.0.0';

const program = new Command();

program
    .name('kstrk')
    .version(VERSION)
    .action(() => program.help())
    .configureHelp(helpConfig)
    .option('-t, --time <time>', 'Set the max time in seconds', parseInt)
    .option('-i --infinite', 'Run indefinitely until interrupted (Ctrl+)')
    .action(init);

function onFinish() {
    process.stdout.write('\x07');
    process.stdout.write(CLEAR_SCREEN);
    process.stdout.write(GREEN + '-> Done!\n');
    process.exit();
}

function ha() {
    const frames = ['-', '\\', '|', '/'];
    let i = 0;

    setInterval(() => {
        process.stdout.write('\x1b[0G' + frames[i % frames.length]); // Move to start of line
        i++;
    }, 100);
}

function init() {
    const options = program.opts();

    let timeRemaining = Infinity;
    if (!options.infinite) {
        timeRemaining = options.time ? options.time : 30;

        setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                render(timeRemaining);
            } else {
                onFinish();
            }
        }, 1000);
    }

    process.stdout.write(CLEAR_SCREEN);
    render(timeRemaining);

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) =>
        handleKeypress(chunk, onFinish, timeRemaining)
    );

    process.on('SIGWINCH', () => {
        render(timeRemaining);
    });
}

program.parse(process.argv);
