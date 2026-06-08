import { LogEvent } from "../models/LogEvent";
import { BrowserInfo } from "./Browser_info";
import { GetUserLocation } from "./GetUserLocation";
import { SessionService } from "./Sessionservice";
import { ApiClient } from "./ApiClient";

export class ConsoleInterceptor {
    private originalLog: typeof console.log;
    private originalError: typeof console.error;
    private originalWarn: typeof console.warn;
    private originalDebug: typeof console.debug;
    private deviceId: string;
    private ws: WebSocket | null = null;
    private reconnectTimeout: any = null;

    constructor(
        private apiClient: ApiClient,
        private browserInfo: BrowserInfo,
        private locationService: GetUserLocation,
        private sessionService: SessionService,
    ) {
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;
        this.originalDebug = console.debug;
        this.deviceId = this.getOrCreateDeviceId();
    }

    start(): void {
        console.log = (...args: unknown[]) => {
            this.originalLog.apply(console, args);
            this.capture("info", args).catch((err) => {
                this.originalError("[ConsoleInterceptor] capture failed:", err);
            });
        };

        console.error = (...args: unknown[]) => {
            this.originalError.apply(console, args);
            this.capture("error", args).catch((err) => {
                this.originalError("[ConsoleInterceptor] capture failed:", err);
            });
        };

        console.warn = (...args: unknown[]) => {
            this.originalWarn.apply(console, args);
            this.capture("warn", args).catch((err) => {
                this.originalError("[ConsoleInterceptor] capture failed:", err);
            });
        };

        console.debug = (...args: unknown[]) => {
            this.originalDebug.apply(console, args);
            this.capture("debug", args).catch((err) => {
                this.originalError("[ConsoleInterceptor] capture failed:", err);
            });
        };

        this.connectWebSocket();
    }

    stop(): void {
        console.log = this.originalLog;
        console.error = this.originalError;
        console.warn = this.originalWarn;
        console.debug = this.originalDebug;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private connectWebSocket(): void {
        if (typeof window === "undefined" || typeof WebSocket === "undefined") return;

        try {
            const endpoint = this.apiClient.getEndpoint();
            const urlObj = new URL(endpoint);
            const wsProto = urlObj.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${wsProto}//${urlObj.host}/sdk/devices/${this.deviceId}/stream`;

            if (this.ws) {
                this.ws.close();
            }

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.originalLog("[Buggy SDK] Connected to status websocket stream");
            };

            this.ws.onclose = () => {
                this.ws = null;
                if (!this.reconnectTimeout) {
                    this.reconnectTimeout = setTimeout(() => {
                        this.reconnectTimeout = null;
                        this.connectWebSocket();
                    }, 5000);
                }
            };

            this.ws.onerror = (err) => {
                this.originalError("[Buggy SDK] Status WebSocket error:", err);
            };
        } catch (e) {
            this.originalError("[Buggy SDK] Failed to connect Status WebSocket:", e);
        }
    }

    private getOrCreateDeviceId(): string {
        if (typeof window === "undefined") {
            return "server-side";
        }
        const storageKey = "buggy_device_id";
        try {
            let deviceId = localStorage.getItem(storageKey);
            if (!deviceId) {
                deviceId = crypto.randomUUID();
                localStorage.setItem(storageKey, deviceId);
            }
            return deviceId;
        } catch (e) {
            return "anonymous-device";
        }
    }

    private safeJSONStringify(obj: unknown): string {
        const visited = new WeakSet();
        try {
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (visited.has(value)) {
                        return "[Circular]";
                    }
                    visited.add(value);
                }
                return value;
            });
        } catch (error) {
            return `[Serialization Failed: ${error instanceof Error ? error.message : String(error)}]`;
        }
    }

    private async capture(
        level: "debug" | "info" | "warn" | "error",
        args: unknown[]
    ): Promise<void> {
        const message = args
            .map((arg) => {
                if (typeof arg === "object" && arg !== null) {
                    return this.safeJSONStringify(arg);
                }
                return String(arg);
            })
            .join(" ");

        let latitude: number | undefined;
        let longitude: number | undefined;

        try {
            const location = await this.locationService.getLocation();
            latitude = location.latitude;
            longitude = location.longitude;
        } catch (error) {
            // Silence geolocation errors or permissions denied
        }

        const logEvent: LogEvent = {
            deviceId: this.deviceId,
            sessionId: this.sessionService.SessionId,
            sessionStartedAt: this.sessionService.SessionStartedAt,
            level,
            message,
            timestamp: new Date().toISOString(),
            browser: this.browserInfo.browser || "Unknown",
            browserVersion: this.browserInfo.browserVersion,
            deviceName: this.browserInfo.deviceModel || "Unknown Device",
            os: this.browserInfo.os,
            latitude,
            longitude,
            url: typeof window !== "undefined" ? window.location?.href || "unknown" : "unknown",
            isOnline: this.sessionService.IsOnline,
        };

        // Use originalLog to output the structured logEvent and avoid infinite recursion
        this.apiClient.send(logEvent);
    }
}