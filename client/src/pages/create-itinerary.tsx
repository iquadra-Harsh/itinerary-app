import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  insertItinerarySchema,
  type InsertItinerary,
  type Itinerary,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Plane,
  Bed,
  Utensils,
  Cake,
  Camera,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

// Confetti celebration function
const triggerConfetti = () => {
  // Create a burst of confetti from multiple angles
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);

    // Left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });

    // Right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

export default function CreateItinerary() {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InsertItinerary>({
    resolver: zodResolver(insertItinerarySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      tripType: "",
      transport: "",
      accommodation: "",
      dining: "",
      ageGroup: "",
      interests: "",
    },
  });

  const createItineraryMutation = useMutation({
    mutationFn: async (data: InsertItinerary) => {
      const res = await apiRequest("POST", "/api/itineraries", data);
      return await res.json();
    },
    onSuccess: async (itinerary: Itinerary) => {
      // Immediately generate the itinerary
      setIsGenerating(true);
      try {
        const res = await apiRequest(
          "POST",
          `/api/itineraries/${itinerary.id}/generate`
        );
        const updatedItinerary = await res.json();

        queryClient.invalidateQueries({ queryKey: ["/api/itineraries"] });
        setLocation(`/itinerary/${updatedItinerary.id}`);
      } catch (error) {
        console.error("Failed to generate itinerary:", error);
        // Still navigate to the itinerary page even if generation fails
        setLocation(`/itinerary/${itinerary.id}`);
      } finally {
        setIsGenerating(false);
        // Trigger confetti celebration for new trip creation
        triggerConfetti();
      }
    },
  });

  const onSubmit = (data: InsertItinerary) => {
    createItineraryMutation.mutate(data);
  };

  const isLoading = createItineraryMutation.isPending || isGenerating;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Plan Your Adventure
              </h1>
            </div>
            <div className="text-sm text-slate-500">Step 1 of 2</div>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {createItineraryMutation.isPending
                ? "Creating Your Itinerary..."
                : "AI is Crafting Your Perfect Trip"}
            </h3>
            <p className="text-slate-600">
              {createItineraryMutation.isPending
                ? "Setting up your adventure details..."
                : "Our AI is analyzing your preferences and creating a personalized travel plan..."}
            </p>
            <div className="mt-4 text-sm text-slate-500">
              This usually takes 10-30 seconds
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <span>Tell us about your dream trip</span>
            </CardTitle>
            <p className="text-slate-600">
              Our AI will create a personalized itinerary just for you
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Title and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="title"
                    className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3"
                  >
                    <span>Trip Title (Optional)</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Romantic Paris Getaway"
                    {...form.register("title")}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700 mb-3 block"
                  >
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your trip"
                    {...form.register("description")}
                  />
                </div>
              </div>

              {/* Basic Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Destination</span>
                  </Label>
                  <Input
                    placeholder="e.g., Paris, France"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Trip Type</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("tripType", value)}
                    defaultValue={form.watch("tripType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Adventure</SelectItem>
                      <SelectItem value="couples">Romantic Getaway</SelectItem>
                      <SelectItem value="family">Family Fun</SelectItem>
                      <SelectItem value="friends">Friends Trip</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tripType && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tripType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Start Date</span>
                  </Label>
                  <Input type="date" {...form.register("startDate")} />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>End Date</span>
                  </Label>
                  <Input type="date" {...form.register("endDate")} />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Transportation and Accommodation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Plane className="h-4 w-4 text-primary" />
                    <span>Transportation</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("transport", value)}
                    defaultValue={form.watch("transport")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="car">Car/Road Trip</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="mixed">
                        Mixed Transportation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.transport && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.transport.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Bed className="h-4 w-4 text-primary" />
                    <span>Accommodation Type</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("accommodation", value)
                    }
                    defaultValue={form.watch("accommodation")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="airbnb">Airbnb/Rental</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="camping">Camping</SelectItem>
                      <SelectItem value="luxury">Luxury/Boutique</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.accommodation && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.accommodation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dining and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Utensils className="h-4 w-4 text-primary" />
                    <span>Dining Preferences</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("dining", value)}
                    defaultValue={form.watch("dining")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dining style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local/Street Food</SelectItem>
                      <SelectItem value="fine">Fine Dining</SelectItem>
                      <SelectItem value="casual">Casual Restaurants</SelectItem>
                      <SelectItem value="mixed">Mixed Options</SelectItem>
                      <SelectItem value="vegetarian">
                        Vegetarian/Vegan
                      </SelectItem>
                      <SelectItem value="budget">Budget-Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.dining && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.dining.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                    <Cake className="h-4 w-4 text-primary" />
                    <span>Age Group</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("ageGroup", value)}
                    defaultValue={form.watch("ageGroup")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">
                        18-25 (Young Adults)
                      </SelectItem>
                      <SelectItem value="26-35">
                        26-35 (Young Professionals)
                      </SelectItem>
                      <SelectItem value="36-50">36-50 (Mid-Career)</SelectItem>
                      <SelectItem value="51-65">
                        51-65 (Pre-Retirement)
                      </SelectItem>
                      <SelectItem value="65+">65+ (Seniors)</SelectItem>
                      <SelectItem value="mixed">Mixed Ages</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.ageGroup && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.ageGroup.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div>
                <Label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-3">
                  <Camera className="h-4 w-4 text-primary" />
                  <span>What would you like to see and do?</span>
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Tell us about your interests... museums, outdoor activities, nightlife, cultural experiences, adventure sports, shopping, etc."
                  {...form.register("interests")}
                />
                {form.formState.errors.interests && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.interests.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white travel-card-hover"
                  disabled={isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Itinerary
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
