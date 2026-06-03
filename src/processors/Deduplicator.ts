export class Deduplicator {
    private lastSeenMap: Map<string, number> = new Map();
    private windowMs: number;

    constructor(windowMs: number) {
        this.windowMs = windowMs;
    }

    public shouldProcess(message: string): boolean {
        const now = Date.now();
        const lastSeen = this.lastSeenMap.get(message);

        // Perform lazy cleanup periodically to prevent memory growth
        if (this.lastSeenMap.size > 1000) {
            this.cleanup(now);
        }

        if (lastSeen !== undefined && now - lastSeen < this.windowMs) {
            return false;
        }

        this.lastSeenMap.set(message, now);
        return true;
    }

    private cleanup(now: number): void {
        for (const [msg, timestamp] of this.lastSeenMap.entries()) {
            if (now - timestamp >= this.windowMs) {
                this.lastSeenMap.delete(msg);
            }
        }
    }

    public clear(): void {
        this.lastSeenMap.clear();
    }
}
