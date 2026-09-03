# Safarn

**Safarn is a modern travel-planning web application for discovering destinations, building itineraries, managing travel budgets, saving experiences, and sharing trips.**

*(Currently in Phase 6: Frontend implementation with local persistence. Cloud backend integration is planned for Phase 7).*

## Overview

Safarn is designed to bring intelligence, elegance, and precision to your travel planning. Whether you're planning a weekend getaway or a multi-city international journey, Safarn helps you seamlessly craft the perfect itinerary.

## Features

- **Destinations & Exploration:** Discover new places and popular activities, categorized by region, travel style, and budget.
- **Smart Itinerary Builder:** Multi-city support, drag-and-drop daily planning, and travel segment management.
- **Trip Budgeting:** Set estimated budgets, track real-time expenses, and visualize spending categories.
- **Wishlist:** Save dream destinations and activities to use in future trips.
- **Trip Sharing:** Generate read-only public links to share your itineraries with friends or fellow travelers.
- **Local Persistence:** Your data stays with you securely in your browser's local storage (Backend integration coming soon).

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + custom glassmorphism design system
- **Routing:** React Router DOM
- **State/Data:** Context API + LocalStorage
- **Forms & Validation:** React Hook Form + Zod
- **Drag and Drop:** dnd-kit
- **Charts:** Recharts

## Project Structure

- `/src/components` - Reusable UI components and feature-specific components.
- `/src/context` - React Context providers for trips, auth, and settings.
- `/src/data` - Mock data and seed data.
- `/src/hooks` - Custom React hooks.
- `/src/pages` - Main page components matching application routes.
- `/src/services` - Abstractions for local persistence and logic.
- `/src/types` - TypeScript interfaces and types.

## Local Development

To run this project locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

For future cloud integration (Phase 7), see `.env.example` for the required keys. 

Currently, no environment variables are needed to run the application in its locally persisted mode.

## Current Phase

- **Phase 6:** Product Completion, Premium Experience & Frontend Feature Hardening. The application is completely functional on the frontend using local storage and mock data.

## Roadmap

- **Phase 7A:** Supabase Setup & Authentication Migration
- **Phase 7B:** Data Migration & RLS (Row Level Security)
- **Phase 8:** Real-time Collaboration & Launch
