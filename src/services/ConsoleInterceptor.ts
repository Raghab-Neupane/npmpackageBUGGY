class consoleInterceptor {
    private originalLog;
    private originalError;
    private originalWarn;
    private originalDebug;

    constructor() {
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;
        this.originalDebug = console.debug;
    }
}