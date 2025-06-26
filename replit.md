# Wanderlust - AI-Powered Travel Itinerary Generator

## Overview

Wanderlust is a full-stack web application that generates personalized travel itineraries using AI. Users can create accounts, input their travel preferences, and receive detailed, customized itineraries powered by OpenAI's API. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React 18 with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Authentication**: Passport.js with local strategy and session-based auth
- **AI Integration**: OpenAI API for itinerary generation
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Component Library**: Built on shadcn/ui with Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Query Management**: TanStack Query for API state management
- **Protected Routes**: Custom authentication wrapper for secured pages

### Backend Architecture
- **API Structure**: RESTful endpoints for user management and itinerary operations
- **Authentication**: Session-based auth with Passport.js LocalStrategy
- **Database Layer**: Drizzle ORM with PostgreSQL adapter
- **AI Service**: Dedicated OpenAI service for itinerary generation
- **Session Storage**: In-memory store for development (configurable for production)

### Database Schema
- **Users**: Basic user information with encrypted passwords
- **Itineraries**: Travel plans with user relationships and generated content stored as JSONB
- **Schema Validation**: Drizzle-Zod integration for type-safe database operations

## Data Flow

1. **User Registration/Login**: Passport.js handles authentication with password hashing
2. **Itinerary Creation**: Users fill out preference forms validated with Zod schemas
3. **AI Generation**: OpenAI API processes preferences and returns structured itinerary data
4. **Data Persistence**: Generated itineraries saved to PostgreSQL with JSONB content
5. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **express-session**: Session management
- **openai**: Official OpenAI API client
- **@radix-ui/***: Headless UI components
- **@tanstack/react-query**: Server state management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is configured for Replit deployment with the following setup:

- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite builds client assets, ESBuild bundles server code
- **Production Server**: Serves static assets and API from single Express instance
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Database**: Uses DATABASE_URL environment variable for PostgreSQL connection

### Build Configuration
- **Development**: `npm run dev` - Starts development server with hot reload
- **Production**: `npm run build` followed by `npm run start`
- **Database**: `npm run db:push` for schema migrations

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Built complete travel itinerary app with Express.js backend and React frontend
  - User authentication with session-based login/registration  
  - Home page showing all user itineraries with travel-themed design
  - Detailed itinerary creation form with all requested fields
  - AI-powered itinerary generation (requires OpenAI API key)
  - PDF export functionality for completed itineraries
  - Professional travel-themed UI with Tailwind CSS
  - Fixed authentication hooks issue for proper login flow
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```