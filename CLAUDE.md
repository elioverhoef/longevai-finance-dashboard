b# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LongevAI Financial Healthspan is a React-based financial dashboard application that analyzes financial transactions and provides insights through various views. The app processes CSV data (particularly from banking/accounting exports) and displays categorized expenses, revenue tracking, project analysis, and financial insights.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Form Handling**: React Hook Form with Zod validation

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (runs on port 8080)
bun run dev

# Build for production
bun run build

# Build for development mode
bun run build:dev

# Run linting
bun run lint

# Preview production build
bun run preview
```

## Environment Variables

The application requires the following environment variables:

- `GEMINI_API_KEY`: Google Gemini API key for AI-powered insights generation. Required for the Insights tab functionality.

## Project Structure

### Core Application Architecture

- **Main App** (`src/App.tsx`): Sets up routing, providers (React Query, Tooltip), and toast notifications
- **Primary Page** (`src/pages/Index.tsx`): Main dashboard with tabbed interface for different financial views
- **Data Management** (`src/hooks/useFinancialData.ts`): Central hook for loading, parsing, and processing financial data

### Component Organization

- **UI Components** (`src/components/ui/`): shadcn/ui components for consistent design system
- **Feature Components** (`src/components/`): Business logic components:
  - `Overview.tsx`: Summary cards and key metrics
  - `Revenue.tsx`: Revenue analysis and charts
  - `Expenses.tsx`: Expense categorization and tracking
  - `Projects.tsx`: Project-based financial analysis
  - `Insights.tsx`: Advanced analytics and insights
  - `Header.tsx`: Navigation and file upload controls

### Data Flow

1. **CSV Upload/Sample Data**: Financial transaction data loaded via `useFinancialData` hook
2. **Data Processing**: Transactions are categorized, aggregated by month/project, and analyzed
3. **State Management**: React Query manages data fetching and caching
4. **View Rendering**: Tabbed interface displays different analytical perspectives

### Key Features

- **CSV Import**: Upload banking/accounting CSV files for analysis
- **Transaction Categorization**: Automatic categorization of income/expenses
- **Project Tracking**: ROI and profitability analysis by project
- **Monthly Analytics**: Trend analysis over time
- **Export Functionality**: Re-export processed data as CSV
- **Dark Mode**: Theme switching capability

## File Import Expectations

The application expects CSV data with columns: Date, Reference, Description, VAT, Amount. Sample data is embedded in `useFinancialData.ts` showing the expected format from banking exports.

## Development Notes

- Server runs on port 8080 (configured in `vite.config.ts`)
- Path alias `@` points to `src/` directory
- ESLint configured with React hooks and TypeScript rules
- Unused variables warning disabled in ESLint config
- Uses Bun for package management (lockfile: `bun.lockb`)

## Authentication & Data Storage

- **Authentication**: Simple password-based login with localStorage persistence (`useAuth.ts`)
- **Local Storage**: SQLite database via `useSQLiteDB.ts` for persistent data storage
- **Password**: Hardcoded in `useAuth.ts` for demo purposes (should be changed for production)

## Data Processing Architecture

- **CSV Parsing**: Multi-section CSV parser handles complex accounting exports with different data types
- **Transaction Categorization**: Keyword-based automatic categorization with manual override capability
- **Project Extraction**: Automatic project assignment based on client names in transaction descriptions
- **SQLite Integration**: All financial data persisted locally for offline functionality