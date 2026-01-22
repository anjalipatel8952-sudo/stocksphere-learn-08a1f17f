import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import StockCard from '@/components/StockCard';
import { useStockData, formatTimeAgo } from '@/context/StockDataContext';
import { Stock } from '@/data/mockStocks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'indian' | 'global';
type SortType = 'name' | 'price' | 'change';

const Stocks: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { stocks, loading, lastUpdated, isLive, refreshStocks } = useStockData();

  // Convert LiveStock to Stock format
  const convertedStocks: Stock[] = useMemo(() => {
    return stocks.map(s => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      change: s.change,
      changePercent: s.changePercent,
      volume: s.volume,
      marketCap: s.marketCap || 'N/A',
      sector: s.sector,
      exchange: s.exchange,
      currency: s.currency,
      high52w: s.high52w || s.price * 1.2,
      low52w: s.low52w || s.price * 0.8,
      pe: s.pe || 0,
      eps: s.eps || 0,
      dividend: s.dividend || 0,
      priceHistory: s.priceHistory || [],
    }));
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    let filtered = convertedStocks;
    
    if (filter === 'indian') {
      filtered = convertedStocks.filter(s => s.exchange === 'NSE' || s.exchange === 'BSE');
    } else if (filter === 'global') {
      filtered = convertedStocks.filter(s => s.exchange === 'NASDAQ' || s.exchange === 'NYSE');
    }
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price': return b.price - a.price;
        case 'change': return b.changePercent - a.changePercent;
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [convertedStocks, filter, sortBy]);

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Explore Stocks
          </h1>
          <p className="text-muted-foreground">
            Browse Indian and global stocks with AI-powered insights. All prices in ₹ (INR).
          </p>
        </motion.section>

        {/* Live Status Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between glass-card rounded-xl p-3 mb-6"
        >
          <div className="flex items-center gap-3">
            {isLive ? (
              <div className="flex items-center gap-2 text-success">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Live Data</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Demo Data</span>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Updated {formatTimeAgo(lastUpdated)}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStocks}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          
          <div className="flex gap-2">
            {/* Filter Buttons */}
            <div className="flex p-1 bg-secondary rounded-lg">
              {(['all', 'indian', 'global'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-all capitalize",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === 'indian' ? '🇮🇳 India' : f === 'global' ? '🌍 Global' : 'All'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 bg-secondary rounded-lg text-sm font-medium border-0 outline-none text-foreground"
            >
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="change">Sort: Change</option>
            </select>

            {/* View Mode */}
            <div className="hidden sm:flex p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stock Grid */}
        {loading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className={viewMode === 'grid' ? "h-48 rounded-xl" : "h-16 rounded-lg"} />
            ))}
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {filteredStocks.map((stock, i) => (
              <StockCard 
                key={stock.symbol} 
                stock={stock} 
                delay={i * 0.03} 
                showAI 
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          Showing {filteredStocks.length} stocks
        </p>
      </div>
    </Layout>
  );
};

export default Stocks;
