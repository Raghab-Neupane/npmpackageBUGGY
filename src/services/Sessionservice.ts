export class SessionService {
    SessionId: string;
    SessionStartedAt: string;
    IsOnline: boolean;

    constructor() {
        this.SessionId = crypto.randomUUID();
        this.SessionStartedAt = new Date().toISOString();

        this.IsOnline = navigator.onLine;

        window.addEventListener("online", () => {
            this.IsOnline = true;
        });

        window.addEventListener("offline", () => {
            this.IsOnline = false;
        });
    }
}