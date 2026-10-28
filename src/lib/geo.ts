import { Clinic } from '../types/database';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Mock "current location" used until expo-location is wired in.
 * Set to Mysuru (AIISH campus area), the platform's home base.
 */
export const DEFAULT_USER_LOCATION: GeoPoint & { label: string } = {
  latitude: 12.3134,
  longitude: 76.6131,
  label: 'Mysuru, Karnataka',
};

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine formula). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** "850 m", "4.2 km", "138 km" */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export type ClinicWithDistance = Clinic & { distanceKm: number; distanceLabel: string };

export function withDistances(clinics: Clinic[], from: GeoPoint = DEFAULT_USER_LOCATION): ClinicWithDistance[] {
  return clinics
    .map((c) => {
      const km = distanceKm(from, c);
      return { ...c, distanceKm: km, distanceLabel: formatKm(km) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
