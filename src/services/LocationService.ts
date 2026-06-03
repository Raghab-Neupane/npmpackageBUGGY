export interface LocationData {
    ip: string;
    country: string;
    city: string;
    region: string;
}

export class LocationService {
    private static instance: LocationService;
    private locationData: LocationData = {
        ip: "unknown",
        country: "unknown",
        city: "unknown",
        region: "unknown",
    };
    private isInitialized = false;
    private initPromise: Promise<LocationData> | null = null;

    private constructor() {}

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    public async initialize(): Promise<LocationData> {
        if (this.isInitialized) {
            return this.locationData;
        }
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                const res = await fetch("https://ipapi.co/json/", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    this.locationData = {
                        ip: data.ip || "unknown",
                        country: data.country_name || data.country || "unknown",
                        city: data.city || "unknown",
                        region: data.region || "unknown",
                    };
                }
            } catch (error) {
                // Silently fail to keep default "unknown" values
            } finally {
                this.isInitialized = true;
            }
            return this.locationData;
        })();

        return this.initPromise;
    }

    public getLocationData(): LocationData {
        return this.locationData;
    }
}
