import { sendLog } from "./transport";
import type { LogEvent } from "./types";
import { getClientIp } from "./services/location";

export function initLogger(endpoint: string) {
    const originalLog = console.log;

    console.log = async (...args: any[]) => {
        originalLog(...args);

        const ip = await getClientIp();

        const payload: LogEvent = {
            level: "log",
            message: args.map(String).join(" "),
            timestamp: new Date().toISOString(),
        };

        sendLog(endpoint, payload);
    };
}