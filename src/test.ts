import { ConsoleInterceptor } from "./services/ConsoleInterceptor";
import { BrowserInfo } from "./services/Browser_info";
import { GetUserLocation } from "./services/GetUserLocation";
import { SessionService } from "./services/Sessionservice";

const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Node.js/22.0";
const browserInfo = new BrowserInfo(userAgent);
const locationService = new GetUserLocation();
const sessionService = new SessionService();

const interceptor = new ConsoleInterceptor(browserInfo, locationService, sessionService);

interceptor.start();

console.log("Hello World");
console.warn("Warning");
console.error("Database Failed");
console.debug("Loading...");