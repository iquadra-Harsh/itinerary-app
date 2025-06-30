import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Navigation,
  Compass,
  Clock,
  Star,
  Camera,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TravelSuggestion {
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

interface LocationSuggestionsProps {
  onSuggestionSelect: (suggestion: TravelSuggestion) => void;
}

export function LocationSuggestions({
  onSuggestionSelect,
}: LocationSuggestionsProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<TravelSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string>("");

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Get location name from coordinates
        try {
          const locationName = await getLocationName(latitude, longitude);
          setLocationName(locationName);
          await loadRealSuggestions(latitude, longitude);
        } catch (err) {
          setError("Failed to get location details");
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setError(`Location access denied: ${error.message}`);
        setIsLoadingLocation(false);
        // Load some popular destinations instead
        loadPopularDestinations();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Convert coordinates to location name using reverse geocoding
  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const city =
          data.address.city || data.address.town || data.address.village;
        const state = data.address.state;
        const country = data.address.country;

        return city && state
          ? `${city}, ${state}`
          : city || state || country || "Unknown Location";
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Error getting location name:", error);
      return "Unknown Location";
    }
  };

  // Load real suggestions from backend API
  const loadRealSuggestions = async (lat: number, lng: number) => {
    setIsLoadingSuggestions(true);
    setError("");

    try {
      // Fetch places from our backend API
      const response = await apiRequest(
        "GET",
        `/api/location-suggestions?lat=${lat}&lng=${lng}`
      );
      const travelSuggestions: TravelSuggestion[] = await response.json();

      if (travelSuggestions.length === 0) {
        setError(
          "No nearby attractions found. Try expanding your search radius or check a different location."
        );
        loadPopularDestinations();
      } else {
        setSuggestions(travelSuggestions);
      }

      setIsLoadingLocation(false);
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setError(
        "Failed to load nearby attractions. Showing popular destinations instead."
      );
      loadPopularDestinations();
      setIsLoadingLocation(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const loadPopularDestinations = () => {
    setIsLoadingSuggestions(true);
    const popularDestinations = getPopularDestinations();

    setTimeout(() => {
      setSuggestions(popularDestinations);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  const getPopularDestinations = (): TravelSuggestion[] => [
    {
      id: "paris-fr",
      name: "Paris, France",
      distance: "Varies",
      travelTime: "Flight required",
      type: "City Break",
      description: "The City of Light with world-famous landmarks and cuisine",
      highlights: ["Eiffel Tower", "Louvre Museum", "Champs-Élysées"],
      bestFor: ["Culture lovers", "Couples", "Art enthusiasts"],
      rating: 4.6,
      location: "Paris, France",
    },
    {
      id: "tokyo-jp",
      name: "Tokyo, Japan",
      distance: "Varies",
      travelTime: "Flight required",
      type: "Cultural Experience",
      description:
        "Ultra-modern city blending ancient traditions with cutting-edge technology",
      highlights: ["Shibuya Crossing", "Temples", "Street food"],
      bestFor: ["Culture enthusiasts", "Food lovers", "Tech enthusiasts"],
      rating: 4.7,
      location: "Tokyo, Japan",
    },
    {
      id: "maldives",
      name: "Maldives",
      distance: "Varies",
      travelTime: "Flight required",
      type: "Tropical Paradise",
      description:
        "Crystal-clear waters and overwater bungalows in the Indian Ocean",
      highlights: ["Private beaches", "Snorkeling", "Luxury resorts"],
      bestFor: ["Couples", "Luxury travelers", "Water sports enthusiasts"],
      rating: 4.8,
      location: "Maldives",
    },
  ];

  useEffect(() => {
    // Load popular destinations on component mount
    loadPopularDestinations();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-primary" />
            <span>Nearby Trip Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>
                {isLoadingLocation ? "Getting Location..." : "Use My Location"}
              </span>
            </Button>
            {locationName && (
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Near {locationName}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingSuggestions
          ? // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {suggestion.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{suggestion.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{suggestion.travelTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {suggestion.rating}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="mb-3">
                    {suggestion.type}
                  </Badge>
                  <p className="text-sm text-slate-600 mb-3">
                    {suggestion.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800 mb-1">
                        Highlights
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.highlights.map(
                          (highlight: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {highlight}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-800 mb-1">
                        Best For
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.bestFor.map(
                          (category: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-primary/10 text-primary"
                            >
                              {category}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => onSuggestionSelect(suggestion)}
                    className="w-full"
                    size="sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Plan Trip Here
                  </Button>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
