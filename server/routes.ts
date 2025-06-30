import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateItinerary } from "./services/openai";
import { googlePlacesService } from "./services/google-places";
import { insertItinerarySchema, updateItinerarySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Itinerary routes
  app.get("/api/itineraries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itineraries = await storage.getItinerariesByUserId(req.user!.id);
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.get("/api/itineraries/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itinerary = await storage.getItinerary(parseInt(req.params.id));
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }

      if (itinerary.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(itinerary);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json({ message: "Failed to fetch itinerary" });
    }
  });

  app.post("/api/itineraries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const itinerary = await storage.createItinerary({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(itinerary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating itinerary:", error);
      res.status(500).json({ message: "Failed to create itinerary" });
    }
  });

  app.post("/api/itineraries/:id/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itinerary = await storage.getItinerary(parseInt(req.params.id));
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }

      if (itinerary.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Generate itinerary using OpenAI
      const generatedContent = await generateItinerary({
        location: itinerary.location,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        tripType: itinerary.tripType,
        transport: itinerary.transport,
        accommodation: itinerary.accommodation,
        dining: itinerary.dining,
        ageGroup: itinerary.ageGroup,
        interests: itinerary.interests,
      });

      // Update itinerary with generated content
      const updatedItinerary = await storage.updateItinerary(itinerary.id, {
        generatedContent: generatedContent as any,
        status: "generated",
      });

      res.json(updatedItinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  app.put("/api/itineraries/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itinerary = await storage.getItinerary(parseInt(req.params.id));
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }

      if (itinerary.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = updateItinerarySchema.partial().parse(req.body);
      const updatedItinerary = await storage.updateItinerary(
        itinerary.id,
        validatedData
      );

      res.json(updatedItinerary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating itinerary:", error);
      res.status(500).json({ message: "Failed to update itinerary" });
    }
  });

  app.delete("/api/itineraries/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itinerary = await storage.getItinerary(parseInt(req.params.id));
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }

      if (itinerary.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteItinerary(itinerary.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      res.status(500).json({ message: "Failed to delete itinerary" });
    }
  });

  // Location suggestions route
  app.get("/api/location-suggestions", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return res
          .status(400)
          .json({ message: "Latitude and longitude are required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = radius ? parseInt(radius as string) : 25000;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      try {
        const places = await googlePlacesService.searchNearbyPlaces(
          latitude,
          longitude,
          searchRadius
        );
        const suggestions =
          googlePlacesService.convertToTravelSuggestions(places);
        res.json(suggestions);
      } catch (apiError) {
        console.log("Google Places API failed, using fallback suggestions");
        const fallbackSuggestions =
          googlePlacesService.getFallbackSuggestions();
        res.json(fallbackSuggestions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      res.status(500).json({ message: "Failed to fetch location suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
