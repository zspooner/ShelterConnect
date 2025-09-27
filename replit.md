# ShelterDog Amplify - MVP

## Overview

ShelterDog Amplify is a full-stack web application designed to help U.S. dog shelters amplify their adoption efforts through automated content generation and volunteer amplification networks. The platform allows shelters to upload dog profiles and automatically generates shareable social media content, while connecting with volunteers who help distribute this content across multiple platforms to increase adoption chances.

The application features a shelter dashboard for managing dog profiles and tracking engagement metrics, a public-facing dog profile system with QR codes for easy sharing, and a volunteer board where community members can claim and complete amplification tasks across social media platforms like Instagram, TikTok, Facebook, and X (Twitter).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Full-Stack Architecture**: Built as a monolithic application with separate client and server directories, designed to run entirely within Replit without external dependencies by default.

**Frontend Framework**: React with TypeScript, Vite for development and bundling, and Wouter for client-side routing. The UI is built using shadcn/ui components with Radix UI primitives, styled with TailwindCSS following a design system inspired by Notion, Linear, and Airbnb.

**Backend Framework**: Node.js with Express server handling API routes, file uploads via Multer, and session-based authentication using Passport.js with local strategy and bcrypt for password hashing.

**Database Layer**: Uses Drizzle ORM with PostgreSQL (via Neon serverless) for production, with a well-defined schema supporting shelters, dogs, volunteers, amplification tasks, adoption inquiries, and analytics tracking.

**File Storage**: Local file system storage in `/uploads` directory for dog photos and generated assets, eliminating need for external cloud storage services.

**Content Generation**: Automated content creation system using OpenAI API (optional) with Canvas API for generating social media images, QR codes, and platform-specific content variations.

**Authentication System**: Session-based authentication for shelters with password hashing, while volunteers use a simplified email-only registration system focused on engagement rather than security.

**State Management**: TanStack Query for server state management, React Context for authentication state, and React hooks for local component state.

**Design System**: Custom design guidelines with defined color palette (emerald green accent, status-specific colors), Inter font family, consistent spacing units, and component library following modern UI patterns.

## External Dependencies

**Database**: Neon Serverless PostgreSQL for production database hosting with WebSocket support for real-time connections.

**AI Content Generation**: OpenAI API integration (optional) for generating enhanced dog profile descriptions and social media captions when API key is provided.

**Font Loading**: Google Fonts API for Inter font family loading in the client application.

**Development Tools**: Replit-specific integrations including vite-plugin-runtime-error-modal and cartographer plugin for enhanced development experience within the Replit environment.

**UI Component Library**: Radix UI primitives for accessible, unstyled components that form the foundation of the shadcn/ui design system.

**Image Processing**: Canvas API for server-side image generation and manipulation, QRCode library for generating shareable QR codes linking to dog profiles.