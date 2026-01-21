import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { TradingProvider } from "@/context/TradingContext";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import StockDetail from "./pages/StockDetail";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Compare from "./pages/Compare";
import Learn from "./pages/Learn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TradingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/stock/:symbol" element={<StockDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TradingProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
