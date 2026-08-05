/**
 * Minimal ambient types for the parts of the Google Maps JavaScript API we use
 * (Places Autocomplete + Geocoding). Kept local so the project does not need
 * the full `@types/google.maps` dependency.
 */

declare namespace google.maps {
  class LatLng {
    lat(): number;
    lng(): number;
  }

  interface GeocoderGeometry {
    location: LatLng;
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GeocoderResult {
    formatted_address: string;
    address_components: GeocoderAddressComponent[];
    geometry: GeocoderGeometry;
  }

  interface GeocoderResponse {
    results: GeocoderResult[];
  }

  class Geocoder {
    geocode(request: { address: string }): Promise<GeocoderResponse>;
  }

  namespace places {
    interface AutocompletePrediction {
      description: string;
      place_id: string;
    }

    interface AutocompletionRequest {
      input: string;
      componentRestrictions?: { country: string | string[] };
      types?: string[];
    }

    class AutocompleteService {
      getPlacePredictions(
        request: AutocompletionRequest,
      ): Promise<{ predictions: AutocompletePrediction[] }>;
    }

    interface PlacePrediction {
      text: { toString(): string };
      placeId: string;
    }

    interface AutocompleteSuggestionResult {
      placePrediction: PlacePrediction | null;
    }

    interface AutocompleteRequest {
      input: string;
      includedRegionCodes?: string[];
      sessionToken?: unknown;
    }

    const AutocompleteSuggestion: {
      fetchAutocompleteSuggestions(
        request: AutocompleteRequest,
      ): Promise<{ suggestions: AutocompleteSuggestionResult[] }>;
    };

    class AutocompleteSessionToken {}
  }
}

interface Window {
  google?: typeof google;
}
