export interface LogEvent {
    level: "log" | "warn" | "error";
    message: string;
    timestamp: string;
}
