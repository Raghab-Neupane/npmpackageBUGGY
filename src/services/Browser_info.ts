import { UAParser } from "ua-parser-js";


export class BrowserInfo {
    browser?: string;
    browserVersion?: string;

    os?: string;
    osVersion?: string;

    deviceModel?: string;
    deviceVendor?: string;
    deviceType?: string;



    constructor(userAgent: string) {
        const parser = new UAParser(userAgent);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();

        this.browser = browser.name;
        this.browserVersion = browser.version;

        this.os = os.name;
        this.osVersion = os.version;

        this.deviceModel = device.model;
        this.deviceVendor = device.vendor;
        this.deviceType = device.type;
    }
}