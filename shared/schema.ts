import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  tripType: text("trip_type").notNull(), // solo, couples, family, friends
  transport: text("transport").notNull(),
  accommodation: text("accommodation").notNull(),
  dining: text("dining").notNull(),
  ageGroup: text("age_group").notNull(),
  interests: text("interests").notNull(),
  generatedContent: jsonb("generated_content"), // AI-generated itinerary content
  status: text("status").default("draft").notNull(), // draft, generated, saved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  userId: true,
  generatedContent: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const updateItinerarySchema = createInsertSchema(itineraries).pick({
  title: true,
  description: true,
  generatedContent: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type UpdateItinerary = z.infer<typeof updateItinerarySchema>;
export type Itinerary = typeof itineraries.$inferSelect;
