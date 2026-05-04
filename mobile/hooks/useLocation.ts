import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeofenceStatus } from '../lib/types';

// Default geofence — this MUST be overridden by real API data at runtime.
// Using a zero-radius sentinel so that location checks fail safely (everyone is
// "outside") until the real campus coordinates are loaded, rather than silently
// granting access to students anywhere in the world.
const DEFAULT_GEOFENCE = {
  lat: 0,
  lng: 0,
  radiusMeters: 0,
  name: 'Campus (not configured)',
};

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000; // metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useLocation(geofence = DEFAULT_GEOFENCE) {
  const [status, setStatus] = useState<GeofenceStatus | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestAndWatch = useCallback(async () => {
    setLoading(true);
    const { status: s } = await Location.requestForegroundPermissionsAsync();
    const granted = s === 'granted';
    setPermissionGranted(granted);
    if (!granted) { setLoading(false); return; }

    // One-shot first reading
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const dist = haversineDistance(loc.coords.latitude, loc.coords.longitude, geofence.lat, geofence.lng);
    setStatus({
      inside: dist <= geofence.radiusMeters,
      distanceMeters: Math.round(dist),
      accuracyMeters: Math.round(loc.coords.accuracy ?? 10),
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      zoneName: geofence.name,
    });
    setLoading(false);

    // Live updates
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (l) => {
        const d = haversineDistance(l.coords.latitude, l.coords.longitude, geofence.lat, geofence.lng);
        setStatus({
          inside: d <= geofence.radiusMeters,
          distanceMeters: Math.round(d),
          accuracyMeters: Math.round(l.coords.accuracy ?? 10),
          lat: l.coords.latitude,
          lng: l.coords.longitude,
          zoneName: geofence.name,
        });
      },
    );
  }, [geofence]);

  useEffect(() => {
    return () => { watchRef.current?.remove(); };
  }, []);

  return { status, permissionGranted, loading, requestAndWatch };
}
