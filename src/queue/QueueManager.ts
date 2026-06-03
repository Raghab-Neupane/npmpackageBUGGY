import { LogEvent } from "../models/LogEvent";

export class QueueManager {
    private queue: LogEvent[] = [];
    private maxQueueSize: number;
    private flushIntervalMs: number;
    private timerId: ReturnType<typeof setInterval> | null = null;
    private onFlush: (logs: LogEvent[]) => Promise<void>;

    constructor(
        maxQueueSize: number,
        flushIntervalMs: number,
        onFlush: (logs: LogEvent[]) => Promise<void>
    ) {
        this.maxQueueSize = maxQueueSize;
        this.flushIntervalMs = flushIntervalMs;
        this.onFlush = onFlush;
        this.startTimer();
    }

    public push(log: LogEvent): void {
        this.queue.push(log);

        if (this.queue.length >= this.maxQueueSize) {
            this.flush();
        }
    }

    public async flush(): Promise<void> {
        if (this.queue.length === 0) {
            return;
        }

        const batch = [...this.queue];
        this.queue = [];

        this.stopTimer();
        this.startTimer();

        try {
            await this.onFlush(batch);
        } catch (error) {
            // Handled by transport retry loop, but caught here as fallback
        }
    }

    private startTimer(): void {
        if (this.timerId === null) {
            this.timerId = setInterval(() => {
                this.flush();
            }, this.flushIntervalMs);
        }
    }

    private stopTimer(): void {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    public destroy(): void {
        this.stopTimer();
        this.flush();
    }
}
