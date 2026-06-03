import { LogEvent } from "./types";

export async function sendLog(
    endpoint: string,
    payload: LogEvent
) {
    try {
        await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            keepalive: true
        })
    } catch (error) {
        console.error("Failed to send log ", error);
    }
}