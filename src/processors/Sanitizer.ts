export class Sanitizer {
    private maxMessageLength: number;

    constructor(maxMessageLength: number) {
        this.maxMessageLength = maxMessageLength;
    }

    public isValid(message: string): boolean {
        if (!message) return false;
        if (message.trim().length === 0) return false;
        return true;
    }

    public sanitize(message: string): string {
        if (message.length > this.maxMessageLength) {
            return message.slice(0, this.maxMessageLength) + "... [truncated]";
        }
        return message;
    }
}
