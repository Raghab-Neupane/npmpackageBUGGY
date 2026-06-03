import { LogEvent } from "../models/LogEvent";
import { calculateBackoff, sleep } from "../utils/backoff";

export class BatchTransport {
    private endpoint: string;
    private maxRetries: number;
    private baseRetryDelayMs: number;
    private maxRetryDelayMs: number;

    constructor(
        endpoint: string,
        maxRetries: number,
        baseRetryDelayMs: number,
        maxRetryDelayMs: number
    ) {
        this.endpoint = endpoint;
        this.maxRetries = maxRetries;
        this.baseRetryDelayMs = baseRetryDelayMs;
        this.maxRetryDelayMs = maxRetryDelayMs;
    }

    public async send(batch: LogEvent[]): Promise<void> {
        let attempt = 0;

        while (attempt <= this.maxRetries) {
            try {
                const response = await fetch(`${this.endpoint}/logs`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(batch),
                    keepalive: true,
                });

                if (response.ok) {
                    return;
                }

                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    return;
                }
            } catch (error) {
                // Network failure
            }

            attempt++;
            if (attempt <= this.maxRetries) {
                const delay = calculateBackoff(
                    attempt,
                    this.baseRetryDelayMs,
                    this.maxRetryDelayMs
                );
                await sleep(delay);
            }
        }
    }
}
