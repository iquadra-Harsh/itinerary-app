import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit3 } from "lucide-react";
import { type Itinerary } from "@shared/schema";

interface EditItineraryDialogProps {
  itinerary: Itinerary;
}

export function EditItineraryDialog({ itinerary }: EditItineraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(itinerary.title);
  const [description, setDescription] = useState(itinerary.description || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateItineraryMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await apiRequest(
        "PUT",
        `/api/itineraries/${itinerary.id}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/itineraries"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/itineraries", itinerary.id.toString()],
      });
      toast({
        title: "Trip updated",
        description: "Your itinerary has been successfully updated.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your trip.",
        variant: "destructive",
      });
      return;
    }
    updateItineraryMutation.mutate({
      title: title.trim(),
      description: description.trim(),
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setTitle(itinerary.title);
      setDescription(itinerary.description || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-white hover:bg-blue-600"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
            <DialogDescription>
              Update the title and description for your trip.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter trip title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter trip description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateItineraryMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateItineraryMutation.isPending}>
              {updateItineraryMutation.isPending
                ? "Updating..."
                : "Update Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
