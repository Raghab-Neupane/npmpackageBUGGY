// export interface LogEvent {
//     id: string;
//     deviceId?: string;
//     level: "debug" | "info" | "warn" | "error";
//     message: string;
//     timestamp: string; // ISO string
//     sessionId: string;
//     ip?: string;
//     country?: string;
//     city?: string;
//     region?: string;
//     latitude?: number;
//     longitude?: number;
//     sdkVersion: string;
//     appVersion: string;
//     userAgent: string;
//     url: string;
//     stackTrace?: string;
// }

export interface LogEvent {
    deviceId: string;
    sessionId: string;
    sessionStartedAt?: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;

    timestamp: string;

    browser: string;
    browserVersion?: string;

    deviceName?: string;
    os?: string;

    latitude?: number;
    longitude?: number;

    url: string;
}
