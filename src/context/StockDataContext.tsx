import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  exchange: string;
  sector: string;
  currency: string;
  lastUpdated: string;
  isLive: boolean;
  note?: string;
  // Additional calculated fields
  marketCap?: string;
  high52w?: number;
  low52w?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  priceHistory?: { date: string; price: number }[];
}

interface StockDataContextType {
  stocks: LiveStock[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
  refreshStocks: () => Promise<void>;
  getStock: (symbol: string) => LiveStock | undefined;
  getStockHistory: (symbol: string) => Promise<{ date: string; price: number }[]>;
  formatTimeAgo: (date: Date | string) => string;
}

const StockDataContext = createContext<StockDataContextType | undefined>(undefined);

// Time ago formatter
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Default stock data with estimated PE, EPS, etc.
const DEFAULT_STOCK_DATA: Record<string, Partial<LiveStock>> = {
  'RELIANCE': { marketCap: '₹19.3L Cr', high52w: 3024.90, low52w: 2220.30, pe: 28.5, eps: 99.91, dividend: 0.35 },
  'TCS': { marketCap: '₹15.1L Cr', high52w: 4592.25, low52w: 3311.05, pe: 31.2, eps: 132.17, dividend: 1.12 },
  'HDFCBANK': { marketCap: '₹12.9L Cr', high52w: 1794.00, low52w: 1363.55, pe: 19.8, eps: 85.31, dividend: 0.95 },
  'INFY': { marketCap: '₹7.6L Cr', high52w: 1953.90, low52w: 1358.35, pe: 27.3, eps: 67.20, dividend: 1.45 },
  'ICICIBANK': { marketCap: '₹8.8L Cr', high52w: 1311.80, low52w: 894.70, pe: 18.9, eps: 65.90, dividend: 0.80 },
  'HINDUNILVR': { marketCap: '₹5.8L Cr', high52w: 2859.30, low52w: 2172.05, pe: 58.2, eps: 42.21, dividend: 1.82 },
  'BHARTIARTL': { marketCap: '₹9.4L Cr', high52w: 1778.95, low52w: 1098.20, pe: 72.5, eps: 21.62, dividend: 0.25 },
  'SBIN': { marketCap: '₹7.4L Cr', high52w: 912.10, low52w: 555.25, pe: 11.2, eps: 73.52, dividend: 1.42 },
  'WIPRO': { marketCap: '₹2.4L Cr', high52w: 526.85, low52w: 390.40, pe: 21.8, eps: 21.43, dividend: 0.21 },
  'TATAMOTORS': { marketCap: '₹3.6L Cr', high52w: 1069.85, low52w: 595.50, pe: 8.9, eps: 110.97, dividend: 0.0 },
  'MARUTI': { marketCap: '₹3.9L Cr', high52w: 13680.00, low52w: 9737.65, pe: 32.1, eps: 388.06, dividend: 0.73 },
  'AXISBANK': { marketCap: '₹3.6L Cr', high52w: 1270.00, low52w: 952.15, pe: 14.7, eps: 80.20, dividend: 0.08 },
  'AAPL': { marketCap: '₹233.8L Cr', high52w: 16669.27, low52w: 13700.68, pe: 28.9, eps: 516.03, dividend: 0.54 },
  'MSFT': { marketCap: '₹258.85L Cr', high52w: 39107.23, low52w: 25839.08, pe: 36.2, eps: 963.59, dividend: 0.68 },
  'GOOGL': { marketCap: '₹183.7L Cr', high52w: 16011.13, low52w: 10804.90, pe: 24.8, eps: 592.85, dividend: 0.0 },
  'AMZN': { marketCap: '₹158.65L Cr', high52w: 16800.20, low52w: 9882.23, pe: 62.1, eps: 248.83, dividend: 0.0 },
  'TSLA': { marketCap: '₹65.90L Cr', high52w: 24990.72, low52w: 11589.80, pe: 68.5, eps: 303.11, dividend: 0.0 },
  'NVDA': { marketCap: '₹183.7L Cr', high52w: 81329.00, low52w: 31192.26, pe: 65.3, eps: 1119.74, dividend: 0.04 },
};

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<LiveStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [historyCache, setHistoryCache] = useState<Record<string, { date: string; price: number }[]>>({});

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { action: 'quotes' },
      });

      if (fnError) throw fnError;

      const enrichedStocks: LiveStock[] = data.stocks.map((stock: LiveStock) => ({
        ...stock,
        ...DEFAULT_STOCK_DATA[stock.symbol],
      }));

      setStocks(enrichedStocks);
      setLastUpdated(new Date(data.lastUpdated));
      setIsLive(enrichedStocks.some((s: LiveStock) => s.isLive));
      
      if (!enrichedStocks.some((s: LiveStock) => s.isLive)) {
        toast.info('Using demo data (API limit reached or market closed)', {
          description: 'Data is for learning purposes only',
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error('Error fetching stocks:', err);
      setError(err.message);
      toast.error('Failed to fetch stock data', {
        description: 'Using cached data if available',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockHistory = useCallback(async (symbol: string): Promise<{ date: string; price: number }[]> => {
    if (historyCache[symbol]) {
      return historyCache[symbol];
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { action: 'history', symbols: [symbol] },
      });

      if (fnError) throw fnError;

      setHistoryCache(prev => ({ ...prev, [symbol]: data.history }));
      return data.history;
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [historyCache]);

  const getStock = useCallback((symbol: string): LiveStock | undefined => {
    return stocks.find(s => s.symbol === symbol);
  }, [stocks]);

  useEffect(() => {
    fetchStocks();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return (
    <StockDataContext.Provider value={{
      stocks,
      loading,
      error,
      lastUpdated,
      isLive,
      refreshStocks: fetchStocks,
      getStock,
      getStockHistory,
      formatTimeAgo,
    }}>
      {children}
    </StockDataContext.Provider>
  );
};

export const useStockData = () => {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error('useStockData must be used within a StockDataProvider');
  }
  return context;
};
