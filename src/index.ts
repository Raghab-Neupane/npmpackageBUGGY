import { LogEvent } from "./models/LogEvent";
import { SDKConfig, DEFAULT_CONFIG } from "./config/SDKConfig";
import { SessionManager } from "./services/SessionManager";
import { LocationService } from "./services/LocationService";
import { Deduplicator } from "./processors/Deduplicator";
import { RateLimiter } from "./processors/RateLimiter";
import { Sanitizer } from "./processors/Sanitizer";
import { QueueManager } from "./queue/QueueManager";
import { BatchTransport } from "./transport/BatchTransport";
import { ConsoleInterceptor } from "./interceptors/ConsoleInterceptor";
import { generateUUID } from "./utils/uuid";

let currentConfig: SDKConfig = { ...DEFAULT_CONFIG };
let deduplicator: Deduplicator;
let rateLimiter: RateLimiter;
let sanitizer: Sanitizer;
let transport: BatchTransport;
let queueManager: QueueManager;
let consoleInterceptor: ConsoleInterceptor;

export let isSDKProcessing = false;

export async function init(options: Partial<SDKConfig> = {}): Promise<void> {
    currentConfig = { ...DEFAULT_CONFIG, ...options };

    const sessionManager = SessionManager.getInstance();
    sessionManager.setAppVersion(currentConfig.appVersion);

    const locationService = LocationService.getInstance();
    
    isSDKProcessing = true;
    try {
        await locationService.initialize();
    } catch {
        // Safe fallback
    } finally {
        isSDKProcessing = false;
    }

    deduplicator = new Deduplicator(currentConfig.dedupeWindowMs);
    rateLimiter = new RateLimiter(currentConfig.rateLimitMaxPerMinute);
    sanitizer = new Sanitizer(currentConfig.maxMessageLength);

    transport = new BatchTransport(
        currentConfig.endpoint,
        currentConfig.maxRetries,
        currentConfig.baseRetryDelayMs,
        currentConfig.maxRetryDelayMs
    );

    queueManager = new QueueManager(
        currentConfig.maxQueueSize,
        currentConfig.flushIntervalMs,
        async (batch) => {
            isSDKProcessing = true;
            try {
                await transport.send(batch);
            } finally {
                isSDKProcessing = false;
            }
        }
    );

    consoleInterceptor = new ConsoleInterceptor((level, message, stackTrace) => {
        if (isSDKProcessing) return;

        if (Math.random() > currentConfig.samplingRate) {
            return;
        }

        if (!sanitizer.isValid(message)) {
            return;
        }
        const cleanMessage = sanitizer.sanitize(message);

        if (!deduplicator.shouldProcess(cleanMessage)) {
            return;
        }

        if (!rateLimiter.shouldProcess()) {
            return;
        }

        const loc = locationService.getLocationData();

        const userAgent =
            typeof window !== "undefined"
                ? window.navigator?.userAgent || "unknown"
                : "unknown";
        const url =
            typeof window !== "undefined"
                ? window.location?.href || "unknown"
                : "unknown";

        const logEvent: LogEvent = {
            id: generateUUID(),
            level,
            message: cleanMessage,
            timestamp: new Date().toISOString(),
            sessionId: sessionManager.getSessionId(),
            ip: loc.ip,
            country: loc.country,
            city: loc.city,
            region: loc.region,
            sdkVersion: sessionManager.getSdkVersion(),
            appVersion: sessionManager.getAppVersion(),
            userAgent,
            url,
            stackTrace,
        };

        queueManager.push(logEvent);
    });

    consoleInterceptor.install();
}

export function initLogger(endpoint: string): void {
    init({ endpoint });
}

export async function flush(): Promise<void> {
    if (queueManager) {
        await queueManager.flush();
    }
}

export function close(): void {
    if (consoleInterceptor) {
        consoleInterceptor.uninstall();
    }
    if (queueManager) {
        queueManager.destroy();
    }
}

export type { LogEvent } from "./models/LogEvent";
export type { SDKConfig } from "./config/SDKConfig";
export { SessionManager } from "./services/SessionManager";
export { LocationService } from "./services/LocationService";
export { Deduplicator } from "./processors/Deduplicator";
export { RateLimiter } from "./processors/RateLimiter";
export { Sanitizer } from "./processors/Sanitizer";
export { QueueManager } from "./queue/QueueManager";
export { BatchTransport } from "./transport/BatchTransport";
export { ConsoleInterceptor } from "./interceptors/ConsoleInterceptor";