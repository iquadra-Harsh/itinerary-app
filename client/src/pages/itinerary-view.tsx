import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Itinerary } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { exportToPDF } from "@/lib/pdf-export";
import {
  ArrowLeft,
  Download,
  Save,
  Calendar,
  Plane,
  Bed,
  Heart,
  MapPin,
  Sun,
  Sunset,
  Moon,
  Lightbulb,
  Clock,
} from "lucide-react";

interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    period: string;
    activity: string;
    location: string;
    duration?: string;
    cost?: string;
    notes?: string;
  }[];
}

interface GeneratedItinerary {
  title: string;
  description: string;
  duration: string;
  days: DayPlan[];
  recommendations: {
    bestPhotoSpots: string[];
    localTips: string[];
    weatherAndPacking: string[];
  };
}

const periodIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
};

const periodColors = {
  morning: "bg-yellow-100 text-yellow-600",
  afternoon: "bg-orange-100 text-orange-600",
  evening: "bg-purple-100 text-purple-600",
};

export default function ItineraryView() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Extract ID from URL path manually since useParams isn't working
  const id = location.split("/").pop();

  // console.log("Extracted ID from URL:", id);

  const {
    data: itinerary,
    isLoading,
    error,
  } = useQuery<Itinerary>({
    queryKey: ["/api/itineraries", id],
    queryFn: async () => {
      // console.log("Fetching itinerary for ID:", id);
      const res = await apiRequest("GET", `/api/itineraries/${id}`);
      const data = await res.json();
      // console.log("Query result:", data);
      return data;
    },
    enabled: !!id,
  });

  console.log(
    "Query state - isLoading:",
    isLoading,
    "itinerary:",
    itinerary,
    "error:",
    error
  );

  const saveItineraryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/itineraries/${id}`, {
        status: "saved",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/itineraries", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/itineraries"] });
    },
  });

  const handleExportPDF = () => {
    if (itinerary && itinerary.generatedContent) {
      exportToPDF(itinerary, itinerary.generatedContent as GeneratedItinerary);
    }
  };

  const handleSave = () => {
    saveItineraryMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Skeleton className="h-8 w-64" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  console.log("Itinerary data:", itinerary);

  if (!itinerary) {
    console.error("Itinerary not found or invalid ID:", id);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Itinerary not found
          </h2>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  console.log("Itinerary data:", itinerary);
  console.log("Generated content:", itinerary.generatedContent);
  const generatedContent =
    itinerary.generatedContent as GeneratedItinerary | null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-slate-800">
                {generatedContent
                  ? "Your AI-Generated Itinerary"
                  : "Itinerary Details"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {itinerary.status !== "saved" && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saveItineraryMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveItineraryMutation.isPending ? "Saving..." : "Save"}
                </Button>
              )}
              {generatedContent && (
                <Button
                  className="bg-accent hover:bg-accent/90 text-white"
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!generatedContent ? (
          // Show basic itinerary info if not generated yet
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 opacity-40">
                  <Clock className="w-full h-full text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  Itinerary not generated yet
                </h3>
                <p className="text-slate-500 mb-6">
                  This itinerary hasn't been generated by AI yet. Would you like
                  to generate it now?
                </p>
                <div className="space-y-4">
                  <div className="text-left max-w-md mx-auto">
                    <p>
                      <strong>Location:</strong> {itinerary.location}
                    </p>
                    <p>
                      <strong>Dates:</strong>{" "}
                      {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                      {new Date(itinerary.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Trip Type:</strong> {itinerary.tripType}
                    </p>
                    <p>
                      <strong>Transportation:</strong> {itinerary.transport}
                    </p>
                  </div>
                  <Button
                    className="bg-accent hover:bg-accent/90 text-white"
                    onClick={() => setLocation(`/create`)}
                  >
                    Generate Itinerary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Trip Overview */}
            <Card className="shadow-lg mb-8">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      {generatedContent.title}
                    </h2>
                    <p className="text-slate-600 mb-6">
                      {generatedContent.description}
                    </p>

                    {/* Trip Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-slate-500">Duration</div>
                        <div className="font-semibold text-slate-800">
                          {generatedContent.duration}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Plane className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-slate-500">Transport</div>
                        <div className="font-semibold text-slate-800 capitalize">
                          {itinerary.transport}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Bed className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-slate-500">Stay</div>
                        <div className="font-semibold text-slate-800 capitalize">
                          {itinerary.accommodation}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-slate-500">Type</div>
                        <div className="font-semibold text-slate-800 capitalize">
                          {itinerary.tripType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl shadow-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                        <p className="text-lg font-semibold text-slate-700">
                          {itinerary.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Itinerary */}
            <div className="space-y-6">
              {generatedContent.days.map((day, index) => (
                <Card key={day.day} className="shadow-lg overflow-hidden">
                  <div className="travel-gradient text-white p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        Day {day.day} - {day.title}
                      </h3>
                      <span className="text-white/80">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {day.activities.map((activity, activityIndex) => {
                        const PeriodIcon =
                          periodIcons[
                            activity.period as keyof typeof periodIcons
                          ] || Sun;
                        const periodColor =
                          periodColors[
                            activity.period as keyof typeof periodColors
                          ] || "bg-gray-100 text-gray-600";

                        return (
                          <div
                            key={activityIndex}
                            className="flex items-start space-x-4"
                          >
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${periodColor}`}
                            >
                              <PeriodIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-slate-800 capitalize">
                                  {activity.period}
                                </h4>
                                <span className="text-sm text-slate-500">
                                  ({activity.time})
                                </span>
                                {activity.duration && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {activity.duration}
                                  </Badge>
                                )}
                                {activity.cost && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.cost}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-600 mb-2">
                                {activity.activity}
                              </p>
                              <p className="text-sm text-slate-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {activity.location}
                              </p>
                              {activity.notes && (
                                <p className="text-sm text-slate-500 mt-1 italic">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            {generatedContent.recommendations && (
              <Card className="shadow-lg mt-8">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <Lightbulb className="h-6 w-6 text-accent mr-2" />
                    AI Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Best Photo Spots
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {generatedContent.recommendations.bestPhotoSpots.map(
                          (spot, index) => (
                            <li key={index}>• {spot}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Local Tips
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {generatedContent.recommendations.localTips.map(
                          (tip, index) => (
                            <li key={index}>• {tip}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Weather & Packing
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {generatedContent.recommendations.weatherAndPacking.map(
                          (item, index) => (
                            <li key={index}>• {item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
