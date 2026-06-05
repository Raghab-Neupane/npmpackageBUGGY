import { SDKConfig } from "./models/SDKConfig";
import { ApiClient } from "./services/ApiClient";
import { BrowserInfo } from "./services/Browser_info";
import { GetUserLocation } from "./services/GetUserLocation";
import { SessionService } from "./services/Sessionservice";
import { ConsoleInterceptor } from "./services/ConsoleInterceptor";

export { ConsoleInterceptor } from "./services/ConsoleInterceptor";
export { BrowserInfo } from "./services/Browser_info";
export { GetUserLocation } from "./services/GetUserLocation";
export { SessionService } from "./services/Sessionservice";
export { ApiClient } from "./services/ApiClient";
export type { LogEvent } from "./models/LogEvent";
export type { SDKConfig } from "./models/SDKConfig";

/**
 * Initializes the Buggy Logging SDK with the provided configuration.
 * Instantiates ApiClient, BrowserInfo, GetUserLocation, and SessionService,
 * and starts the ConsoleInterceptor.
 * 
 * @param config SDKConfig object containing the target backend endpoint
 * @returns The active ConsoleInterceptor instance
 */
export function init(config: SDKConfig): ConsoleInterceptor {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Node.js Environment";
    
    // Instantiate ApiClient with user-provided endpoint
    const apiClient = new ApiClient(config.endpoint);
    
    // Instantiate services
    const browserInfo = new BrowserInfo(userAgent);
    const locationService = new GetUserLocation();
    const sessionService = new SessionService();
    
    // Instantiate ConsoleInterceptor with injected dependencies
    const interceptor = new ConsoleInterceptor(
        apiClient,
        browserInfo,
        locationService,
        sessionService
    );
    
    // Start intercepting console calls
    interceptor.start();
    
    return interceptor;
}
