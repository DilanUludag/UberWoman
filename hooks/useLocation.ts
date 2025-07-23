import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      // Web geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              heading: position.coords.heading || undefined,
            });
            setLoading(false);
          },
          (error) => {
            setError(error.message);
            setLoading(false);
            // Fallback to default location (San Francisco)
            setLocation({
              latitude: 37.7749,
              longitude: -122.4194,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        setError('Geolocation not supported');
        setLoading(false);
        // Fallback location
        setLocation({
          latitude: 37.7749,
          longitude: -122.4194,
        });
      }
    } else {
      // For mobile, you would use expo-location
      // For now, use fallback location
      setLocation({
        latitude: 37.7749,
        longitude: -122.4194,
      });
      setLoading(false);
    }
  };

  const watchLocation = (callback: (location: LocationCoords) => void) => {
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      return navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
          };
          setLocation(newLocation);
          callback(newLocation);
        },
        (error) => {
          setError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    }
    return null;
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    watchLocation,
  };
}