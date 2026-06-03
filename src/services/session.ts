import { generateUUID } from "../utils/uuid";

export interface SessionContext {
    sessionId: string;
    userAgent: string;
    pageUrl: string;
}

export class SessionManager {
    private static instance: SessionManager;
    private sessionId: string;
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

    public getSessionId(): string {
        return this.sessionId;
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
        };
    }
}
