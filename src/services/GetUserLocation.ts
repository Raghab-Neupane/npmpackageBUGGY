//get the Browser Location using the GeoLocation package!

//For this one we call the api directly from the js api and ask for the permission to the users.


export interface UserLocation {
    latitude?: number;
    longitude?: number;
}

//---Use of the async is must because calculation and the user permission takes time we use promise as well!

export class GetUserLocation {
    async getLocation(): Promise<UserLocation> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}

