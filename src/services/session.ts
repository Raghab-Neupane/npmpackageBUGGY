import { generateUUID } from "../utils/uuid";
import getBrowserFingerprint from "get-browser-fingerprint";
// @ts-ignore
import locationMock from "location";

export interface LocationDetails {
    href?: string;
    origin?: string;
    protocol?: string;
    host?: string;
    hostname?: string;
    port?: string;
    pathname?: string;
    search?: string;
    hash?: string;
}

export interface SessionContext {
    sessionId: string;
    userAgent: string;
    pageUrl: string;
    deviceId: string;
    location?: LocationDetails;
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

    public async initialize(_endpoint: string, cacheDurationMs: number): Promise<void> {
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

        const location = this.getLocationDetails();
        const pageUrl = location.href || "unknown";

        return {
            sessionId: this.sessionId,
            userAgent,
            pageUrl,
            deviceId: this.deviceId,
            location,
        };
    }

    private getLocationDetails(): LocationDetails {
        const source =
            typeof window !== "undefined" && window.location
                ? window.location
                : (locationMock as LocationDetails);

        return {
            href: source.href,
            origin: source.origin,
            protocol: source.protocol,
            host: source.host,
            hostname: source.hostname,
            port: source.port,
            pathname: source.pathname,
            search: source.search,
            hash: source.hash,
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
