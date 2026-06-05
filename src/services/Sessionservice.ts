export class SessionService {
    SessionId: string;
    SessionStartedAt: string;



    constructor() {
        this.SessionId = crypto.randomUUID();
        this.SessionStartedAt = new Date().toISOString();
    }

}