// Location utilities for auto-capturing user location
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export class LocationService {
  // Get current location using browser geolocation
  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Try to get address using reverse geocoding
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              ...address
            });
          } catch (error) {
            // Return coordinates only if reverse geocoding fails
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding using a free service (OpenStreetMap Nominatim)
  private static async reverseGeocode(lat: number, lon: number): Promise<Partial<LocationData>> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NaijaSnackTrack-App'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        return {
          address: data.display_name,
          city: data.address.city || data.address.town || data.address.village,
          state: data.address.state,
          country: data.address.country
        };
      }
      
      throw new Error('No address found');
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {};
    }
  }

  // Format location for display
  static formatLocation(location: LocationData): string {
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    }
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
}