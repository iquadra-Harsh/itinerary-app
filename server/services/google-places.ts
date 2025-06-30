interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
}

export interface TravelSuggestion {
  id: string;
  name: string;
  distance: string;
  travelTime: string;
  type: string;
  description: string;
  highlights: string[];
  bestFor: string[];
  rating: number;
  location: string;
  photos?: string[];
}

class GooglePlacesService {
  private readonly API_BASE = "https://maps.googleapis.com/maps/api/place";
  private readonly API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  private getUrl(endpoint: string): string {
    return `${this.API_BASE}/${endpoint}`;
  }

  async searchNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 25000
  ): Promise<GooglePlace[]> {
    if (!this.API_KEY) {
      throw new Error("Google Places API key not configured");
    }

    try {
      console.log("Google Places API request started");

      // Search for tourist attractions, museums, and points of interest
      const url = this.getUrl("nearbysearch/json");
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: radius.toString(),
        type: "tourist_attraction",
        key: this.API_KEY,
      });

      console.log("Google Places API URL:", `${url}?${params}`);
      console.log("Google Places API Key present:", !!this.API_KEY);

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Google Places API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Google Places API Error Response:", errorText);
        throw new Error(
          `Google Places API error: ${response.status} ${response.statusText}`
        );
      }

      const data: GooglePlacesResponse = await response.json();
      console.log("Google Places API Response:", JSON.stringify(data, null, 2));

      if (data.status !== "OK") {
        console.log(
          "Google Places API Error:",
          data.error_message || data.status
        );
        throw new Error(
          `Google Places API error: ${data.status} - ${
            data.error_message || "Unknown error"
          }`
        );
      }

      return data.results || [];
    } catch (error) {
      console.error("Error fetching places from Google Places:", error);
      throw error;
    }
  }

  convertToTravelSuggestions(places: GooglePlace[]): TravelSuggestion[] {
    console.log(
      `Converting ${places.length} Google Places to travel suggestions`
    );

    return places
      .filter((place) => this.isValidTravelDestination(place))
      .slice(0, 8) // Limit to 8 suggestions
      .map((place) => this.mapPlaceToSuggestion(place));
  }

  private isValidTravelDestination(place: GooglePlace): boolean {
    // Filter for travel-relevant places
    const travelTypes = [
      "tourist_attraction",
      "museum",
      "amusement_park",
      "zoo",
      "aquarium",
      "art_gallery",
      "park",
      "natural_feature",
      "point_of_interest",
      "establishment",
    ];

    return place.types.some((type) => travelTypes.includes(type));
  }

  private mapPlaceToSuggestion(place: GooglePlace): TravelSuggestion {
    // Calculate approximate distance (this is a rough calculation)
    const distanceKm = Math.random() * 20 + 1; // Random for demo, would use actual distance
    const distanceStr =
      distanceKm < 1
        ? `${Math.round(distanceKm * 1000)}m`
        : `${distanceKm.toFixed(1)}km`;

    // Calculate travel time (rough estimate: 5km/h walking, 25km/h driving)
    const travelTimeMinutes = Math.round(distanceKm * 12); // Assume mixed transport
    const travelTimeStr =
      travelTimeMinutes < 60
        ? `${travelTimeMinutes}min`
        : `${Math.round(travelTimeMinutes / 60)}h ${travelTimeMinutes % 60}min`;

    // Get photos if available
    const photos =
      place.photos
        ?.slice(0, 3)
        .map(
          (photo) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API}`
        ) || [];

    return {
      id: place.place_id,
      name: place.name,
      distance: distanceStr,
      travelTime: travelTimeStr,
      type: this.getPlaceType(place),
      description: this.generateDescription(place),
      highlights: this.generateHighlights(place),
      bestFor: this.determineBestFor(place),
      rating: place.rating || 4.0,
      location: place.vicinity || "Location not specified",
      photos: photos,
    };
  }

  private getPlaceType(place: GooglePlace): string {
    const typeMap: { [key: string]: string } = {
      tourist_attraction: "Tourist Attraction",
      museum: "Museum",
      amusement_park: "Amusement Park",
      zoo: "Zoo",
      aquarium: "Aquarium",
      art_gallery: "Art Gallery",
      park: "Park",
      natural_feature: "Natural Feature",
      point_of_interest: "Point of Interest",
    };

    for (const type of place.types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }

    return "Attraction";
  }

  private generateDescription(place: GooglePlace): string {
    const type = this.getPlaceType(place);
    const rating = place.rating ? ` with ${place.rating} stars` : "";

    return `A popular ${type.toLowerCase()} in the area${rating}. ${
      place.name
    } offers visitors an authentic local experience and is well-regarded by travelers.`;
  }

  private generateHighlights(place: GooglePlace): string[] {
    const highlights = [];

    if (place.rating && place.rating >= 4.5) {
      highlights.push("Highly rated destination");
    }

    if (place.user_ratings_total && place.user_ratings_total > 100) {
      highlights.push("Popular with visitors");
    }

    if (place.photos && place.photos.length > 0) {
      highlights.push("Photo-worthy location");
    }

    // Add type-specific highlights
    if (place.types.includes("museum")) {
      highlights.push("Educational experience", "Cultural significance");
    } else if (place.types.includes("park")) {
      highlights.push("Outdoor activities", "Nature experience");
    } else if (place.types.includes("tourist_attraction")) {
      highlights.push("Must-see destination", "Local landmark");
    }

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  private determineBestFor(place: GooglePlace): string[] {
    const bestFor = [];

    if (place.types.includes("museum") || place.types.includes("art_gallery")) {
      bestFor.push("Culture enthusiasts", "History buffs");
    }

    if (
      place.types.includes("park") ||
      place.types.includes("natural_feature")
    ) {
      bestFor.push("Nature lovers", "Outdoor activities");
    }

    if (place.types.includes("amusement_park") || place.types.includes("zoo")) {
      bestFor.push("Families", "Adventure seekers");
    }

    if (place.types.includes("tourist_attraction")) {
      bestFor.push("First-time visitors", "Sightseeing");
    }

    // Default categories
    if (bestFor.length === 0) {
      bestFor.push("All travelers", "Local exploration");
    }

    return bestFor.slice(0, 2); // Limit to 2 categories
  }

  // Fallback suggestions for when API fails
  getFallbackSuggestions(): TravelSuggestion[] {
    return [
      {
        id: "fallback-1",
        name: "Local Discovery Walk",
        distance: "2.5km",
        travelTime: "30min",
        type: "Walking Tour",
        description:
          "Explore the charming streets and hidden gems of your neighborhood.",
        highlights: ["Local culture", "Hidden spots", "Photo opportunities"],
        bestFor: ["Explorers", "Photography"],
        rating: 4.2,
        location: "City Center",
        photos: [],
      },
      {
        id: "fallback-2",
        name: "Historic Downtown",
        distance: "5.1km",
        travelTime: "45min",
        type: "Historic District",
        description:
          "Discover the rich history and architecture of the downtown area.",
        highlights: ["Historic buildings", "Local restaurants", "Shopping"],
        bestFor: ["History buffs", "Architecture lovers"],
        rating: 4.5,
        location: "Downtown",
        photos: [],
      },
      {
        id: "fallback-3",
        name: "City Park & Gardens",
        distance: "3.8km",
        travelTime: "20min",
        type: "Park",
        description:
          "Relax and enjoy nature in the beautiful city park with gardens.",
        highlights: [
          "Peaceful atmosphere",
          "Beautiful gardens",
          "Walking trails",
        ],
        bestFor: ["Nature lovers", "Relaxation"],
        rating: 4.3,
        location: "Park District",
        photos: [],
      },
    ];
  }
}

export const googlePlacesService = new GooglePlacesService();
