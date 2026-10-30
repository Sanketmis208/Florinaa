import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Keep retrying server/network errors for ~45s: a sleeping Render instance answers 429 while it wakes up.
      // Client errors like 401/404 are not retried.
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500 && status !== 408 && status !== 429) return false;
        return failureCount < 6;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
