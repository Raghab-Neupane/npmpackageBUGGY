export interface LogEvent {
    id: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    timestamp: string; // ISO string
    sessionId: string;
    ip: string;
    country: string;
    city: string;
    region: string;
    sdkVersion: string;
    appVersion: string;
    userAgent: string;
    url: string;
    stackTrace?: string;
}
