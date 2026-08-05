/**
 * Google Maps Platform helpers for the booking flow.
 *
 * This is the one part of the otherwise fully mocked booking flow that needs a
 * real, billed Google Maps Platform API key with the **Places API** and
 * **Geocoding API** enabled. Google's address APIs have no meaningful offline
 * mock mode, so without a key the address field degrades to plain text entry
 * and the flow falls back to manual city matching.
 *
 * The key must come from the environment (`VITE_GOOGLE_MAPS_API_KEY`) and be
 * restricted in the Google Cloud console to those two APIs and to the site's
 * domain. Never hardcode it.
 */

const API_KEY = import.meta.env["VITE_GOOGLE_MAPS_API_KEY"] as string | undefined;

export const hasGoogleMapsKey = Boolean(API_KEY);
if (typeof window !== "undefined") {
  console.debug("[googleMaps] API key detected:", hasGoogleMapsKey);
}

let loadPromise: Promise<typeof google> | null = null;

/** Loads the Maps JS API once and resolves with the `google` namespace. */
export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (!API_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"));
  }
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<typeof google>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    const script = existing ?? document.createElement("script");

    script.dataset["googleMaps"] = "true";
    if (!existing) {
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        API_KEY,
      )}&libraries=places&loading=async&v=weekly`;
      script.async = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded without a maps namespace"));
    });
    script.addEventListener("error", () => {
      console.error("[googleMaps] script failed to load — check API key and restrictions");
      loadPromise = null;
      reject(new Error("Failed to load the Google Maps script"));
    });
  });

  return loadPromise;
}

export type AddressSuggestion = {
  description: string;
  placeId: string;
};

/**
 * Fetches address predictions for the given text.
 *
 * Prefers the Places API (New) `AutocompleteSuggestion` surface and falls back
 * to the legacy `AutocompleteService` for keys that only have the classic
 * Places API enabled.
 */
export async function fetchAddressSuggestions(input: string): Promise<AddressSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 3) return [];

  const maps = await loadGoogleMaps();
  const places = maps.maps.places;

  if (places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
    try {
      const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: trimmed,
        includedRegionCodes: ["us"],
      });
      return suggestions
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => Boolean(p))
        .map((p) => ({ description: p.text.toString(), placeId: p.placeId }));
    } catch (err) {
      console.warn("[googleMaps] New Places API failed, falling back to legacy:", err);
    }
  }

  const service = new places.AutocompleteService();
  const { predictions } = await service.getPlacePredictions({
    input: trimmed,
    componentRestrictions: { country: "us" },
  });
  return predictions.map((p) => ({ description: p.description, placeId: p.place_id }));
}

export type GeocodedAddress = {
  formattedAddress: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
};

function component(result: google.maps.GeocoderResult, type: string, short = false): string {
  const match = result.address_components.find((c) => c.types.includes(type));
  if (!match) return "";
  return short ? match.short_name : match.long_name;
}

/** Geocodes free-text address input into coordinates and address parts. */
export async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  const maps = await loadGoogleMaps();
  const { results } = await new maps.maps.Geocoder().geocode({ address });
  const result = results[0];
  if (!result) return null;

  return {
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
    city:
      component(result, "locality") ||
      component(result, "sublocality") ||
      component(result, "administrative_area_level_3"),
    state: component(result, "administrative_area_level_1", true),
    zip: component(result, "postal_code"),
  };
}
