import { extendedServiceArea, serviceAreas } from "@/data/site";

export type MatchedServiceArea = {
  /** Hub or tier name the delivery pricing came from. */
  name: string;
  /** Straight-line miles from the customer's address to the nearest hub. */
  distanceMiles: number;
  /** Nearest hub, even when the extended tier ends up applying. */
  nearestHubName: string;
  freeDeliveryThreshold: number;
  standardFee: number;
  note: string;
};

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance in miles. Straight-line distance is deliberate here —
 * we only need to pick which pricing tier applies, not a driving route.
 */
export function distanceInMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Matches an arbitrary coordinate to Jump City's nearest delivery hub.
 *
 * Returns `null` when the address is beyond every hub radius and beyond the
 * extended tier — the caller should then block checkout with an
 * "outside our service area" message rather than invent a fee.
 */
export function matchServiceArea(location: {
  lat: number;
  lng: number;
}): MatchedServiceArea | null {
  const ranked = serviceAreas
    .map((area) => ({ area, distanceMiles: distanceInMiles(location, area) }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  const nearest = ranked[0];
  if (!nearest) return null;

  const inRadius = ranked.find((r) => r.distanceMiles <= r.area.radiusMiles);
  if (inRadius) {
    return {
      name: inRadius.area.name,
      distanceMiles: inRadius.distanceMiles,
      nearestHubName: nearest.area.name,
      freeDeliveryThreshold: inRadius.area.freeDeliveryThreshold,
      standardFee: inRadius.area.standardFee,
      note: inRadius.area.note,
    };
  }

  if (nearest.distanceMiles <= extendedServiceArea.radiusMiles) {
    return {
      name: extendedServiceArea.name,
      distanceMiles: nearest.distanceMiles,
      nearestHubName: nearest.area.name,
      freeDeliveryThreshold: extendedServiceArea.freeDeliveryThreshold,
      standardFee: extendedServiceArea.standardFee,
      note: extendedServiceArea.note,
    };
  }

  return null;
}
