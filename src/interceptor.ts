import { sendLog } from "./transport";
import { LogEvent } from "./types";

export function initLogger(endpoint: string) {
    const originalLog = console.log;

    console.log = (...args: any[]) => {
        originalLog(...args);

        const payload: LogEvent = {
            level: "log",
            message: args.map(String).join(" "),
            timestamp: new Date().toISOString(),
        };

        sendLog(endpoint, payload);
    };
}