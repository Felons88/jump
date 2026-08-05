/**
 * Mapbox Geocoding API helpers for the booking flow.
 *
 * Uses the Mapbox Geocoding API v5 for address autocomplete suggestions and
 * forward geocoding. Unlike Google Maps, Mapbox doesn't require loading a
 * JS SDK — it's all REST calls with the public token.
 *
 * The token must come from the environment (`VITE_MAPBOX_TOKEN`) and be
 * restricted in the Mapbox dashboard to the site's domain. Never hardcode it.
 */

const MAPBOX_TOKEN = import.meta.env["VITE_MAPBOX_TOKEN"] as string | undefined;

export const hasMapboxToken = Boolean(MAPBOX_TOKEN);

// Bias results toward Minnesota for better local autocomplete relevance.
const MN_PROXIMITY = "-93.265,44.978";

export type AddressSuggestion = {
  description: string;
  placeId: string;
  city: string;
  state: string;
  zip: string;
};

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  place_type?: string[];
  center?: [number, number];
  geometry?: { coordinates: [number, number] };
  context?: { id: string; text: string }[];
};

type MapboxResponse = {
  features: MapboxFeature[];
};

export async function fetchAddressSuggestions(input: string): Promise<AddressSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 3 || !MAPBOX_TOKEN) return [];

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json` +
    `?autocomplete=true&access_token=${MAPBOX_TOKEN}&country=us&limit=5&proximity=${MN_PROXIMITY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox API returned ${res.status}`);
    const data = (await res.json()) as MapboxResponse;
    return (data.features || []).map((f) => {
      let city = "";
      let state = "";
      let zip = "";

      if (f.place_type?.includes("place")) city = f.text;
      if (f.place_type?.includes("postcode")) zip = f.text;
      if (f.place_type?.includes("region")) state = f.text;

      for (const ctx of f.context ?? []) {
        if (ctx.id.startsWith("place") && !city) city = ctx.text;
        if (ctx.id.startsWith("postcode") && !zip) zip = ctx.text;
        if (ctx.id.startsWith("region") && !state) state = ctx.text;
      }

      return { description: f.place_name, placeId: f.id, city, state, zip };
    });
  } catch (err) {
    console.error("[mapbox] suggestion fetch failed:", err);
    return [];
  }
}

export type GeocodedAddress = {
  formattedAddress: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
};

/** Geocodes free-text address input into coordinates and address parts. */
export async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  if (!MAPBOX_TOKEN) return null;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
    `?access_token=${MAPBOX_TOKEN}&country=us&limit=1&proximity=${MN_PROXIMITY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox API returned ${res.status}`);
    const data = (await res.json()) as MapboxResponse;
    const feature = data.features?.[0];
    if (!feature) return null;

    const coords = feature.center ?? feature.geometry?.coordinates;
    if (!coords) return null;

    let city = "";
    let state = "";
    let zip = "";

    if (feature.place_type?.includes("place")) city = feature.text;
    if (feature.place_type?.includes("postcode")) zip = feature.text;
    if (feature.place_type?.includes("region")) state = feature.text;

    for (const ctx of feature.context ?? []) {
      if (ctx.id.startsWith("place") && !city) city = ctx.text;
      if (ctx.id.startsWith("postcode") && !zip) zip = ctx.text;
      if (ctx.id.startsWith("region") && !state) state = ctx.text;
    }

    return {
      formattedAddress: feature.place_name,
      lng: coords[0],
      lat: coords[1],
      city,
      state,
      zip,
    };
  } catch (err) {
    console.error("[mapbox] geocode failed:", err);
    return null;
  }
}
