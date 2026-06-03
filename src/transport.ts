import { LogEvent } from "./types";
import { config } from "./services/config";

export async function sendLog(
    payload: LogEvent
) {
    try {
        console.log("Sending:", payload);

        const response = await fetch(
            `${config.endpoint}/logs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                keepalive: true
            }
        );

        console.log("Status:", response.status);

        const data = await response.json();

        console.log("Response:", data);

        return data;
    } catch (error) {
        console.error("Failed to send log", error);
    }
}