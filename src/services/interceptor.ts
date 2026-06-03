export class ConsoleInterceptor {
    private originalLog = console.log.bind(console);
    private originalWarn = console.warn.bind(console);
    private originalError = console.error.bind(console);

    private isIntercepting = false;
    private onLogCaptured: (
        level: "debug" | "info" | "warn" | "error",
        message: string,
        stackTrace?: string
    ) => void;

    constructor(
        onLogCaptured: (
            level: "debug" | "info" | "warn" | "error",
            message: string,
            stackTrace?: string
        ) => void
    ) {
        this.onLogCaptured = onLogCaptured;
    }

    public install(): void {
        const wrapConsole = (
            level: "debug" | "info" | "warn" | "error",
            original: (...args: any[]) => void
        ) => {
            return (...args: any[]) => {
                original(...args);

                if (this.isIntercepting) {
                    return;
                }

                this.isIntercepting = true;
                try {
                    const message = args
                        .map((arg) => {
                            if (typeof arg === "object" && arg !== null) {
                                try {
                                    return JSON.stringify(arg);
                                } catch {
                                    return String(arg);
                                }
                            }
                            return String(arg);
                        })
                        .join(" ");

                    this.onLogCaptured(level, message);
                } catch (e) {
                    // Fallback
                } finally {
                    this.isIntercepting = false;
                }
            };
        };

        console.log = wrapConsole("info", this.originalLog);
        console.warn = wrapConsole("warn", this.originalWarn);
        console.error = wrapConsole("error", this.originalError);

        if (typeof window !== "undefined") {
            window.addEventListener("error", this.handleWindowError);
            window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
        }
    }

    public uninstall(): void {
        console.log = this.originalLog;
        console.warn = this.originalWarn;
        console.error = this.originalError;

        if (typeof window !== "undefined") {
            window.removeEventListener("error", this.handleWindowError);
            window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
        }
    }

    private handleWindowError = (event: ErrorEvent) => {
        if (this.isIntercepting) return;
        this.isIntercepting = true;
        try {
            const message = event.message || "Uncaught Error";
            const stackTrace = event.error?.stack || "";
            this.onLogCaptured("error", message, stackTrace);
        } catch {
            // ignore
        } finally {
            this.isIntercepting = false;
        }
    };

    private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (this.isIntercepting) return;
        this.isIntercepting = true;
        try {
            const reason = event.reason;
            const message = reason instanceof Error ? reason.message : String(reason);
            const stackTrace = reason instanceof Error ? reason.stack : "";
            this.onLogCaptured("error", `Unhandled Rejection: ${message}`, stackTrace);
        } catch {
            // ignore
        } finally {
            this.isIntercepting = false;
        }
    };
}
