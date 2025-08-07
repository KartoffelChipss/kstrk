export interface TypedStats {
    correctlyTyped: number;
    totalTyped: number;
}

export interface Stats {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    timeSpent: number; // Time spent in seconds
    totalTyped: number;
    correctlyTyped: number;
    errors: number;
}

export function calculateStats(
    typedStats: TypedStats,
    timeInSeconds: number
): Stats {
    const totalTyped = typedStats.totalTyped;
    const correctlyTyped = typedStats.correctlyTyped;

    const wpm = Math.round(correctlyTyped / (5 * (timeInSeconds / 60)));
    const rawWpm = Math.round(totalTyped / (5 * (timeInSeconds / 60)));
    const accuracy =
        totalTyped > 0 ? Math.round((correctlyTyped / totalTyped) * 100) : 0;

    return {
        wpm,
        rawWpm,
        accuracy,
        timeSpent: timeInSeconds,
        totalTyped,
        correctlyTyped,
        errors: totalTyped - correctlyTyped
    };
}
