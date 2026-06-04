export interface SDKConfig {
    endpoint: string;
    appVersion: string;
    dedupeWindowMs: number;
    maxMessageLength: number;
    rateLimitMaxPerMinute: number;
    samplingRate: number; // 0.0 to 1.0 (1.0 means 100%)
    maxQueueSize: number;
    flushIntervalMs: number;
    maxRetries: number;
    baseRetryDelayMs: number;
    maxRetryDelayMs: number;
    deviceIdCacheDurationMs: number;
}

export const DEFAULT_CONFIG: SDKConfig = {
    endpoint: "http://172.16.30.84:8000",
    appVersion: "1.0.0",
    dedupeWindowMs: 2000,
    maxMessageLength: 1000,
    rateLimitMaxPerMinute: 100,
    samplingRate: 1.0,
    maxQueueSize: 30,
    flushIntervalMs: 5000,
    maxRetries: 5,
    baseRetryDelayMs: 1000,
    maxRetryDelayMs: 30000,
    deviceIdCacheDurationMs: 24 * 60 * 60 * 1000, // 24 hours
};
