import { generateUUID } from "../utils/uuid";

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
}
