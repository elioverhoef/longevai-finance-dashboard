# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LongevAI Financial Healthspan is a React-based financial dashboard that analyzes transaction data from CSV files. It offers a modular, high-performance interface with features like automatic categorization, project-based analysis, and AI-driven strategic insights.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **Local Database**: SQL.js (SQLite in the browser, persisted via localStorage)
- **AI Insights**: Google Gemini
- **State Management**: Custom hooks (`useFinancialData`, `useInsights`)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **CSV Parsing**: PapaParse

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (runs on port 8080)
bun run dev

# Start secure development data server (runs on port 3001) - for development only
bun run dev-server

# Build for production (embeds data securely for static deployment)
bun run build

# Embed financial data for production build
bun run embed-data

# Run linting
bun run lint

# Preview production build
bun run preview

# (For developers) Pre-generate a DB from the sample CSV
bun run import-data
```

## Environment Variables

The application requires a `.env` file in the project root:

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key. This is essential for the AI Insights feature.

## Project Structure

### Core Application Architecture

- **Main App** (`src/App.tsx`): Sets up routing and providers.
- **Primary Page** (`src/pages/Index.tsx`): The main dashboard view, which is kept lean and acts as a container.
- **Data Hooks**:
  - `src/hooks/useSQLiteDB.ts`: Manages the in-browser SQLite database.
  - `src/hooks/useFinancialData.ts`: Central controller hook for loading, parsing, filtering, and preparing all financial data for the UI.
  - `src/hooks/useInsights.ts`: Manages fetching and caching AI-generated insights from Gemini.
- **Configuration**:
  - `src/config/categorization.ts`: Contains keywords for automatically categorizing transactions and identifying projects. This is the primary file to edit for tuning the categorization logic.
- **Utilities**:
  - `src/lib/data-processor.ts`: Contains the core logic for parsing the multi-section CSV files and applying categorization rules.
  - `src/lib/crypto.ts`: Provides hashing functionality for caching AI insights.
- **AI Service**:
  - `src/services/gemini.ts`: A dedicated service class that formats data and communicates with the Google Gemini API.

### Data Flow

1. **Initial Load**: On first visit, `useFinancialData` securely fetches data from the development data server (during development) or through proper authentication (in production).
2. **Processing & Storage**: The CSV content is parsed by `data-processor.ts`, and the resulting structured data is saved into the in-browser SQLite database via `useSQLiteDB.ts`.
3. **Subsequent Loads**: The app loads data directly from the persisted SQLite database in `localStorage`.
4. **User Upload**: A user can upload a new CSV, which overwrites the existing data in the database.
5. **AI Insights**: `useInsights` generates a hash of the current transaction data. It checks `localStorage` for cached insights matching this hash. If not found, it calls the `GeminiService` to get new insights and caches them.

### Security & Deployment

- **Sensitive Data Protection**: Financial data (CSV, JSON) is stored in the secure `data/` directory, not in the public folder.
- **Development Data Server**: A dedicated development server (`server/dev-server.js`) serves financial data securely during local development.
- **Static Deployment Ready**: Production builds embed financial data securely at build time, enabling deployment to static hosting platforms like Netlify without requiring a backend server.
- **Build-Time Embedding**: The `scripts/embed-data.mjs` script securely embeds financial data into the frontend bundle during the build process.
- **Public Assets**: Only the `sql-wasm.wasm` WebAssembly library remains in the public folder as it's required for browser SQLite functionality.
- **No Backend Required**: The app works entirely client-side with embedded data, perfect for static deployment.

## Authentication

- A simple password-based login is managed by `useAuth.ts`. The password is in the hook for demo purposes.
- Authentication state is persisted in `localStorage`.

This refactored structure ensures a clean separation of concerns, enhances performance through caching, and improves maintainability by externalizing configuration.