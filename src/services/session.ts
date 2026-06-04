import { generateUUID } from "../utils/uuid";
import getBrowserFingerprint from "get-browser-fingerprint";

export interface SessionContext {
    sessionId: string;
    userAgent: string;
    pageUrl: string;
    deviceId: string;
}

export class SessionManager {
    private static instance: SessionManager;
    private sessionId: string;
    private deviceId: string = "";
    private sdkVersion: string = "1.0.0";
    private appVersion: string = "1.0.0";

    private constructor() {
        this.sessionId = generateUUID();
    }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public async initialize(cacheDurationMs: number): Promise<void> {
        this.deviceId = await this.getOrGenerateDeviceId(cacheDurationMs);
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public getDeviceId(): string {
        return this.deviceId;
    }

    public getSdkVersion(): string {
        return this.sdkVersion;
    }

    public getAppVersion(): string {
        return this.appVersion;
    }

    public setAppVersion(version: string): void {
        this.appVersion = version;
    }

    public getSessionContext(): SessionContext {
        const userAgent =
            typeof window !== "undefined"
                ? window.navigator?.userAgent || "unknown"
                : "unknown";
        const pageUrl =
            typeof window !== "undefined"
                ? window.location?.href || "unknown"
                : "unknown";

        return {
            sessionId: this.sessionId,
            userAgent,
            pageUrl,
            deviceId: this.deviceId,
        };
    }

    private async getOrGenerateDeviceId(cacheDurationMs: number): Promise<string> {
        if (typeof window === "undefined") {
            return "server-side";
        }

        const storageKey = "buggy_device_id";
        const tsKey = "buggy_device_id_last_updated";

        let cachedId = "";
        try {
            cachedId = localStorage.getItem(storageKey) || "";
        } catch (e) {
            // ignore
        }

        let lastUpdated = "";
        try {
            lastUpdated = localStorage.getItem(tsKey) || "";
        } catch (e) {
            // ignore
        }

        const now = Date.now();

        if (cachedId && lastUpdated) {
            const timeDiff = now - parseInt(lastUpdated, 10);
            if (timeDiff < cacheDurationMs) {
                return cachedId;
            }
        }

        try {
            const fingerprint = await getBrowserFingerprint();
            const fingerprintStr = String(fingerprint);

            try {
                localStorage.setItem(storageKey, fingerprintStr);
                localStorage.setItem(tsKey, String(now));
            } catch (e) {
                // ignore
            }
            return fingerprintStr;
        } catch (e) {
            if (cachedId) {
                return cachedId;
            }
            const newId = generateUUID();
            try {
                localStorage.setItem(storageKey, newId);
                localStorage.setItem(tsKey, String(now));
            } catch (storageErr) {
                // ignore
            }
            return newId;
        }
    }
}
