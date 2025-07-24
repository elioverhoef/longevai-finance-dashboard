# LongevAI Financial Healthspan Dashboard

This project is a sophisticated financial analysis tool built with React, Vite, and shadcn/ui. It provides AI-powered insights into financial data, helping users understand their financial healthspan with a focus on longevity-related investments and business operations.

## How to Run This Project

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Bun**: This project uses Bun as the package manager for speed and efficiency. [Install Bun](https://bun.sh/docs/installation).

### Local Development

1.  **Clone the repository**:
    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install dependencies**:
    ```sh
    bun install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root of the project and add your Google Gemini API key:
    ```
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Initial Data Setup**:
    The application is designed to work with a sample CSV file located at `public/export_202501..202512.csv`. On first launch, the app will automatically fetch this file and populate a local in-browser SQLite database.

5.  **Start the development server**:
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:8080`.

### Development Scripts

-   `bun run dev`: Starts the development server.
-   `bun run build`: Builds the application for production.
-   `bun run lint`: Lints the codebase using ESLint.
-   `bun run preview`: Previews the production build locally.
-   `bun run import-data`: (For developers) A Node.js script to pre-generate a database file from the CSV. See `scripts/import-data.mjs` for details.

## Core Technologies

-   **Framework**: React 18 with TypeScript
-   **Build Tool**: Vite
-   **UI**: shadcn/ui on top of Radix UI and Tailwind CSS
-   **Data Fetching**: React Query for server state management
-   **Charting**: Recharts
-   **Local Database**: SQL.js (SQLite compiled to WebAssembly)
-   **AI Insights**: Google Gemini
-   **CSV Parsing**: PapaParse

## Architecture Highlights

-   **Modular Hooks**: Business logic is encapsulated in custom hooks (`useFinancialData`, `useInsights`, `useSQLiteDB`) for clean separation of concerns.
-   **Component-Based UI**: A rich library of components in `src/components` provides the building blocks for the dashboard.
-   **In-Browser Database**: Utilizes SQL.js to create a persistent SQLite database in the user's browser via `localStorage`, ensuring data privacy and offline capabilities.
-   **AI-Powered Insights with Caching**: Leverages Google Gemini for financial analysis. To optimize performance and cost, insights are cached in `localStorage` and only regenerated when the underlying data changes or a manual refresh is requested.
-   **Configuration-Driven**: Key business logic, like transaction categorization, is managed through a simple configuration file (`src/config/categorization.ts`), making it easy to adapt and extend.