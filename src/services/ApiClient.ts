import { LogEvent } from "../models/LogEvent";

export class ApiClient {

    //exports the API to the external server route!

    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public getEndpoint(): string {
        return this.endpoint;
    }

    async send(logEvent: LogEvent): Promise<void> {
        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(logEvent),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to send log. Status: ${response.status}`
                );
            }
        } catch (error) {
            console.error(
                "[SDK API ERROR]:",
                error
            );
        }
    }

}