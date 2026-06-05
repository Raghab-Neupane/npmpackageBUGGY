import { LogEvent } from "../models/LogEvent";
import { BrowserInfo } from "./Browser_info";
import { GetUserLocation } from "./GetUserLocation";
import { SessionService } from "./Sessionservice";

export class ConsoleInterceptor {
    private originalLog: typeof console.log;
    private originalError: typeof console.error;
    private originalWarn: typeof console.warn;
    private originalDebug: typeof console.debug;

    constructor(
        private browserInfo: BrowserInfo,
        private locationService: GetUserLocation,
        private sessionService: SessionService
    ) {
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;
        this.originalDebug = console.debug;
    }

    start(): void {
        console.log = (...args: unknown[]) => {
            this.originalLog.apply(console, args);
            this.capture("info", args);
        };

        console.error = (...args: unknown[]) => {
            this.originalError.apply(console, args);
            this.capture("error", args);
        };

        console.warn = (...args: unknown[]) => {
            this.originalWarn.apply(console, args);
            this.capture("warn", args);
        };

        console.debug = (...args: unknown[]) => {
            this.originalDebug.apply(console, args);
            this.capture("debug", args);
        };
    }

    stop(): void {
        console.log = this.originalLog;
        console.error = this.originalError;
        console.warn = this.originalWarn;
        console.debug = this.originalDebug;
    }

    private async capture(
        level: "debug" | "info" | "warn" | "error",
        args: unknown[]
    ): Promise<void> {
        const message = args
            .map((arg) => {
                if (typeof arg === "object") {
                    return JSON.stringify(arg);
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
            deviceId: this.sessionService.SessionId,
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
        };

        // Use originalLog to output the structured logEvent and avoid infinite recursion
        this.originalLog("[CAPTURED LOG EVENT]:", logEvent);
    }
}