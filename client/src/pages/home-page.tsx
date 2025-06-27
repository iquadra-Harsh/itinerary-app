import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Itinerary } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Compass,
  Plus,
  LogOut,
  Users,
  User,
  Heart,
  UserCheck,
  MapPin,
  Calendar,
  Trash2,
} from "lucide-react";

const tripTypeIcons = {
  solo: User,
  couples: Heart,
  family: Users,
  friends: UserCheck,
};

const statusColors = {
  draft: "bg-orange-100 text-orange-700",
  generated: "bg-blue-100 text-blue-700",
  saved: "bg-green-100 text-green-700",
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: itineraries, isLoading } = useQuery<Itinerary[]>({
    queryKey: ["/api/itineraries"],
  });

  const deleteItineraryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/itineraries/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/itineraries"] });
      toast({
        title: "Trip deleted",
        description: "Your itinerary has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: number, title: string) => {
    e.preventDefault(); // Prevent navigation to itinerary view
    e.stopPropagation();

    if (
      confirm(
        `Are you sure you want to delete "${
          title || "this trip"
        }"? This action cannot be undone.`
      )
    ) {
      deleteItineraryMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Wanderlust</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">{user?.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Your Travel Adventures
          </h2>
          <p className="text-slate-600">
            Plan, explore, and remember every journey
          </p>
        </div>

        {/* Create New Itinerary Button */}
        <div className="mb-8">
          <Link href="/create">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white shadow-lg travel-card-hover"
            >
              <Plus className="h-5 w-5 mr-2" />
              Plan New Adventure
            </Button>
          </Link>
        </div>

        {/* Itineraries Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !itineraries || itineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 opacity-40">
              <MapPin className="w-full h-full text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No adventures yet
            </h3>
            <p className="text-slate-500 mb-6">
              Start planning your first trip to see it here!
            </p>
            <Link href="/create">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Itinerary
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => {
              const TripIcon =
                tripTypeIcons[
                  itinerary.tripType as keyof typeof tripTypeIcons
                ] || User;

              return (
                <Card
                  key={itinerary.id}
                  className="overflow-hidden travel-card-hover cursor-pointer"
                >
                  <Link href={`/itinerary/${itinerary.id}`}>
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">
                          {itinerary.location}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-slate-800 truncate">
                          {itinerary.title || `${itinerary.location} Adventure`}
                        </h3>
                        <Badge
                          className={
                            statusColors[
                              itinerary.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {itinerary.status === "draft"
                            ? "Planning"
                            : itinerary.status === "generated"
                            ? "Generated"
                            : "Saved"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-slate-600 mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                          {new Date(itinerary.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {itinerary.description && (
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {itinerary.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <TripIcon className="h-4 w-4" />
                          <span className="capitalize">
                            {itinerary.tripType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-white hover:bg-primary"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) =>
                              handleDelete(e, itinerary.id, itinerary.title)
                            }
                            className="text-red-500 hover:text-white hover:bg-red-600"
                            disabled={deleteItineraryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
