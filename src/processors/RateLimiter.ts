export class RateLimiter {
    private logTimestamps: number[] = [];
    private maxPerMinute: number;

    constructor(maxPerMinute: number) {
        this.maxPerMinute = maxPerMinute;
    }

    public shouldProcess(): boolean {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Filter out timestamps older than 1 minute
        this.logTimestamps = this.logTimestamps.filter((ts) => ts > oneMinuteAgo);

        if (this.logTimestamps.length >= this.maxPerMinute) {
            return false;
        }

        this.logTimestamps.push(now);
        return true;
    }

    public clear(): void {
        this.logTimestamps = [];
    }
}
