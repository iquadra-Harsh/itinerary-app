import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, Compass, Clock, Star, Camera } from "lucide-react";

interface TripSuggestion {
  name: string;
  distance: string;
  travelTime: string;
  type: string;
  description: string;
  highlights: string[];
  bestFor: string[];
  rating: number;
}

interface LocationSuggestionsProps {
  onSuggestionSelect: (suggestion: TripSuggestion) => void;
}

export function LocationSuggestions({
  onSuggestionSelect,
}: LocationSuggestionsProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([]);
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
          await loadSuggestions(latitude, longitude);
        } catch (err) {
          setError("Failed to get location details");
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        setError(`Location access denied: ${error.message}`);
        setIsLoadingLocation(false);
        // Load some default suggestions instead
        loadDefaultSuggestions();
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

  // Load trip suggestions based on location
  const loadSuggestions = async (lat: number, lng: number) => {
    setIsLoadingSuggestions(true);

    // Generate suggestions based on location
    // In a real app, this would call a travel API or database
    const mockSuggestions = generateLocationBasedSuggestions(
      lat,
      lng,
      locationName
    );

    // Simulate API delay
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsLoadingSuggestions(false);
    }, 1000);
  };

  const loadDefaultSuggestions = () => {
    setIsLoadingSuggestions(true);
    const defaultSuggestions = getPopularDestinations();

    setTimeout(() => {
      setSuggestions(defaultSuggestions);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  // Generate suggestions based on geographic location
  const generateLocationBasedSuggestions = (
    lat: number,
    lng: number,
    location: string
  ): TripSuggestion[] => {
    // Determine region and suggest appropriate destinations
    const isUSA = lat > 25 && lat < 50 && lng > -125 && lng < -65;
    const isEurope = lat > 35 && lat < 70 && lng > -10 && lng < 40;
    const isAsia = lat > -10 && lat < 55 && lng > 60 && lng < 150;

    if (isUSA) {
      return [
        {
          name: "Yellowstone National Park",
          distance: "250 miles",
          travelTime: "4h 30m drive",
          type: "National Park",
          description:
            "America's first national park with geysers, wildlife, and stunning landscapes",
          highlights: [
            "Old Faithful",
            "Grand Canyon of Yellowstone",
            "Wildlife viewing",
          ],
          bestFor: ["Nature lovers", "Families", "Adventure seekers"],
          rating: 4.8,
        },
        {
          name: "Napa Valley",
          distance: "180 miles",
          travelTime: "3h drive",
          type: "Wine Region",
          description:
            "World-renowned wine country with rolling vineyards and luxury resorts",
          highlights: ["Wine tasting", "Michelin restaurants", "Scenic drives"],
          bestFor: ["Couples", "Food & wine enthusiasts"],
          rating: 4.6,
        },
        {
          name: "Grand Canyon",
          distance: "320 miles",
          travelTime: "5h 15m drive",
          type: "Natural Wonder",
          description: "One of the seven natural wonders of the world",
          highlights: ["South Rim views", "Hiking trails", "Sunrise/sunset"],
          bestFor: ["Adventure seekers", "Photographers", "Nature lovers"],
          rating: 4.9,
        },
      ];
    } else if (isEurope) {
      return [
        {
          name: "Swiss Alps",
          distance: "200 km",
          travelTime: "2h 30m drive",
          type: "Mountain Region",
          description:
            "Breathtaking alpine scenery with pristine lakes and charming villages",
          highlights: ["Matterhorn", "Jungfraujoch", "Lake Geneva"],
          bestFor: ["Adventure seekers", "Nature lovers", "Photographers"],
          rating: 4.9,
        },
        {
          name: "Tuscany",
          distance: "150 km",
          travelTime: "2h drive",
          type: "Cultural Region",
          description:
            "Rolling hills, medieval towns, and world-class wine and cuisine",
          highlights: ["Florence", "Siena", "Chianti wine region"],
          bestFor: ["Art lovers", "Food enthusiasts", "Couples"],
          rating: 4.7,
        },
        {
          name: "Santorini",
          distance: "300 km",
          travelTime: "1h flight",
          type: "Greek Island",
          description: "Iconic blue-domed churches and stunning sunset views",
          highlights: ["Oia sunset", "Red Beach", "Wine tasting"],
          bestFor: ["Couples", "Photographers", "Luxury travelers"],
          rating: 4.8,
        },
      ];
    } else if (isAsia) {
      return [
        {
          name: "Kyoto",
          distance: "150 km",
          travelTime: "1h 30m train",
          type: "Cultural City",
          description:
            "Ancient temples, traditional gardens, and preserved geisha districts",
          highlights: ["Bamboo Grove", "Golden Pavilion", "Geisha district"],
          bestFor: ["Culture enthusiasts", "Photographers", "History buffs"],
          rating: 4.8,
        },
        {
          name: "Bali",
          distance: "800 km",
          travelTime: "2h flight",
          type: "Tropical Paradise",
          description:
            "Lush rice terraces, ancient temples, and pristine beaches",
          highlights: ["Ubud rice terraces", "Beach resorts", "Temple tours"],
          bestFor: [
            "Relaxation seekers",
            "Adventure lovers",
            "Spiritual travelers",
          ],
          rating: 4.7,
        },
        {
          name: "Himalayas",
          distance: "400 km",
          travelTime: "6h drive",
          type: "Mountain Range",
          description:
            "World's highest peaks with incredible trekking and spiritual experiences",
          highlights: [
            "Mount Everest",
            "Trekking routes",
            "Buddhist monasteries",
          ],
          bestFor: ["Adventure seekers", "Trekkers", "Spiritual travelers"],
          rating: 4.9,
        },
      ];
    }

    // Default global suggestions
    return getPopularDestinations();
  };

  const getPopularDestinations = (): TripSuggestion[] => [
    {
      name: "Paris, France",
      distance: "Varies",
      travelTime: "Flight required",
      type: "City Break",
      description: "The City of Light with world-famous landmarks and cuisine",
      highlights: ["Eiffel Tower", "Louvre Museum", "Champs-Élysées"],
      bestFor: ["Culture lovers", "Couples", "Art enthusiasts"],
      rating: 4.6,
    },
    {
      name: "Tokyo, Japan",
      distance: "Varies",
      travelTime: "Flight required",
      type: "Cultural Experience",
      description:
        "Ultra-modern city blending ancient traditions with cutting-edge technology",
      highlights: ["Shibuya Crossing", "Temples", "Street food"],
      bestFor: ["Culture enthusiasts", "Food lovers", "Tech enthusiasts"],
      rating: 4.7,
    },
    {
      name: "Maldives",
      distance: "Varies",
      travelTime: "Flight required",
      type: "Tropical Paradise",
      description:
        "Crystal-clear waters and overwater bungalows in the Indian Ocean",
      highlights: ["Private beaches", "Snorkeling", "Luxury resorts"],
      bestFor: ["Couples", "Luxury travelers", "Water sports enthusiasts"],
      rating: 4.8,
    },
  ];

  useEffect(() => {
    // Load default suggestions on component mount
    loadDefaultSuggestions();
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
                        {suggestion.highlights.map((highlight, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-800 mb-1">
                        Best For
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.bestFor.map((category, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            {category}
                          </Badge>
                        ))}
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
