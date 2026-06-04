import { generateUUID } from "../utils/uuid";
import getBrowserFingerprint from "get-browser-fingerprint";
// @ts-ignore
import locationMock from "location";

export interface LocationDetails {
    ip?: string;
    country?: string;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
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
    private location?: LocationDetails;

    private constructor() {
        this.sessionId = generateUUID();
    }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public async initialize(endpoint: string, cacheDurationMs: number): Promise<void> {
        this.deviceId = await this.getOrGenerateDeviceId(cacheDurationMs);
        await this.fetchLocationDetails(endpoint);
    }

    private async fetchLocationDetails(endpoint: string): Promise<void> {
        try {
            const response = await fetch(`${endpoint}/location`);
            if (response.ok) {
                const data = await response.json();
                this.location = {
                    ip: data.ip,
                    country: data.country,
                    city: data.city,
                    region: data.region,
                    latitude: data.latitude,
                    longitude: data.longitude,
                };
            }
        } catch (e) {
            // ignore
        }
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

        let pageUrl = "unknown";
        if (typeof window !== "undefined" && window.location) {
            pageUrl = window.location.href || "unknown";
        } else {
            try {
                pageUrl = (locationMock as any)?.href || "unknown";
            } catch (e) {
                // ignore
            }
        }

        return {
            sessionId: this.sessionId,
            userAgent,
            pageUrl,
            deviceId: this.deviceId,
            location: this.location,
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
