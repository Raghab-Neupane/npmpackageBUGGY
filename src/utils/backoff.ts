export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateBackoff(
    attempt: number,
    baseDelay: number,
    maxDelay: number
): number {
    const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
    return Math.random() * delay;
}
