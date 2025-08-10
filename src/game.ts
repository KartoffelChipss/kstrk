import { Command } from 'commander';
import { calculateTypedStats, handleKeypress, render } from './render.js';
import { CLEAR_SCREEN, ALT_BUFFER_ON, ALT_BUFFER_OFF } from './util/ansi.js';
import { calculateStats, displayTypingStats, TypedStats } from './stats.js';

function enterAltBuffer() {
    process.stdout.write(ALT_BUFFER_ON);
    process.stdout.write('\x1b[H');}

function leaveAltBuffer() {
    process.stdout.write(ALT_BUFFER_OFF);
}

function onFinish(typedStats: TypedStats, timeInSeconds: number) {
    const stats = calculateStats(typedStats, timeInSeconds);

    leaveAltBuffer();

    console.log();
    displayTypingStats(stats);
    process.exit();
}

export function startGame(program: Command) {
    const options = program.opts();

    let timeSpent = 0;
    const maxTime = options.time ? options.time : 30;
    let timerStarted = false;
    let timerInterval: NodeJS.Timeout | null = null;

    const startTimer = () => {
        if (timerStarted) return;
        timerStarted = true;

        timerInterval = setInterval(() => {
            timeSpent++;
            if (options.infinite) return render(Infinity);
            if (timeSpent < maxTime) {
                render(maxTime - timeSpent);
            } else {
                if (timerInterval) clearInterval(timerInterval);
                onFinish(calculateTypedStats(), maxTime);
            }
        }, 1000);
    };

    const getTimeRemaining = () =>
        options.infinite ? Infinity : maxTime - timeSpent;

    enterAltBuffer();

    process.stdout.write(CLEAR_SCREEN);
    render(getTimeRemaining());

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) =>
        handleKeypress(
            chunk,
            (typedStats) => {
                if (timerInterval) clearInterval(timerInterval);
                onFinish(typedStats, timeSpent || 1);
            },
            getTimeRemaining(),
            startTimer
        )
    );

    process.on('SIGWINCH', () => {
        render(getTimeRemaining());
    });

    process.on('SIGINT', () => {
        leaveAltBuffer();
        process.exit();
    });
}

