import { Command } from 'commander';
import { calculateTypedStats, handleKeypress, render } from './render';
import { CLEAR_SCREEN, GREEN } from './ansi';
import { calculateStats, TypedStats } from './statsCollector';

function onFinish(typedStats: TypedStats, timeInSeconds: number) {
    const stats = calculateStats(typedStats, timeInSeconds);
    process.stdout.write(CLEAR_SCREEN);

    process.stdout.write(
        `\n${GREEN}WPM: ${stats.wpm} | Raw WPM: ${stats.rawWpm} | Accuracy: ${stats.accuracy}% | Time Spent: ${timeInSeconds}s | Errors: ${stats.errors}\n`
    );

    process.stdout.write(GREEN + '-> Done!\n');
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
                onFinish(typedStats, timeSpent || 1); // use at least 1 second
            },
            getTimeRemaining(),
            startTimer
        )
    );

    process.on('SIGWINCH', () => {
        render(getTimeRemaining());
    });
}
