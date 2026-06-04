export interface LogEvent {
    id: string;
    deviceId?: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    timestamp: string; // ISO string
    sessionId: string;
    location?: {
        href?: string;
        origin?: string;
        protocol?: string;
        host?: string;
        hostname?: string;
        port?: string;
        pathname?: string;
        search?: string;
        hash?: string;
    };
    sdkVersion: string;
    appVersion: string;
    userAgent: string;
    url: string;
    stackTrace?: string;
}
