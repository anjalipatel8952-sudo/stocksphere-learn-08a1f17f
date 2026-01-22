import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Newspaper, Sparkles, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import MarketIndexCard from '@/components/MarketIndexCard';
import StockCard from '@/components/StockCard';
import NewsCard from '@/components/NewsCard';
import { useStockData, formatTimeAgo } from '@/context/StockDataContext';
import { marketIndices, stockNews, Stock } from '@/data/mockStocks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { stocks, loading, lastUpdated, isLive, refreshStocks } = useStockData();

  // Convert LiveStock to Stock format for StockCard compatibility
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

  const topGainers = useMemo(() => 
    [...convertedStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
    [convertedStocks]
  );

  const topLosers = useMemo(() => 
    [...convertedStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
    [convertedStocks]
  );

  const mostActive = useMemo(() => 
    [...convertedStocks].sort((a, b) => 
      parseFloat(b.volume?.replace(/[^0-9.]/g, '') || '0') - parseFloat(a.volume?.replace(/[^0-9.]/g, '') || '0')
    ).slice(0, 5),
    [convertedStocks]
  );

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Welcome to{' '}
            <span className="gradient-text">StockSphere</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Learn stock trading with virtual money. Practice without risk.
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
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

        {/* Virtual Learning Notice */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-primary font-medium">
            🎓 All trading is virtual with demo money for learning purposes only. All prices shown in ₹ (INR).
          </p>
        </div>

        {/* Market Indices */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Market Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {marketIndices.slice(0, 8).map((index, i) => (
              <MarketIndexCard key={index.name} index={index} delay={i * 0.05} />
            ))}
          </div>
        </section>

        {/* Three Columns: Gainers, Losers, Most Active */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Top Gainers */}
          <section className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <h2 className="font-semibold text-foreground">Top Gainers</h2>
            </div>
            {loading ? <LoadingSkeleton /> : (
              <div className="space-y-1">
                {topGainers.map((stock, i) => (
                  <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
                ))}
              </div>
            )}
          </section>

          {/* Top Losers */}
          <section className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <h2 className="font-semibold text-foreground">Top Losers</h2>
            </div>
            {loading ? <LoadingSkeleton /> : (
              <div className="space-y-1">
                {topLosers.map((stock, i) => (
                  <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
                ))}
              </div>
            )}
          </section>

          {/* Most Active */}
          <section className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Most Active</h2>
            </div>
            {loading ? <LoadingSkeleton /> : (
              <div className="space-y-1">
                {mostActive.map((stock, i) => (
                  <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* News Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Latest News</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockNews.map((news, i) => (
              <NewsCard key={news.id} news={news} delay={i * 0.05} />
            ))}
          </div>
        </section>

        {/* Featured Stocks */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Popular Stocks</h2>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topGainers.slice(0, 4).map((stock, i) => (
                <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} showAI />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
