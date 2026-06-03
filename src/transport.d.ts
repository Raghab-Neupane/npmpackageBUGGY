import { LogEvent } from "./types";
export declare function sendLog(endpoint: string, payload: LogEvent): Promise<void>;
