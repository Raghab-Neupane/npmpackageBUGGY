export { initLogger } from "./interceptor";
export type { LogEvent } from "./types";

import { config } from "../src/services/config";

export function init(options: { endpoint: string }) {
    config.endpoint = options.endpoint;
}