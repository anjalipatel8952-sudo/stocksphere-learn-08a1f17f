import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, StarOff, TrendingUp, TrendingDown, Building2, Activity, Percent } from 'lucide-react';
import Layout from '@/components/Layout';
import StockChart from '@/components/StockChart';
import TradingPanel from '@/components/TradingPanel';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { allStocks } from '@/data/mockStocks';
import { useTrading } from '@/context/TradingContext';
import { cn } from '@/lib/utils';

const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useTrading();

  const stock = allStocks.find(s => s.symbol === symbol);

  if (!stock) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Stock Not Found</h1>
          <Link to="/stocks" className="text-primary hover:underline">
            Browse all stocks
          </Link>
        </div>
      </Layout>
    );
  }

  const inWatchlist = isInWatchlist(stock.symbol);
  const isPositive = stock.change >= 0;

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/stocks"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stocks</span>
        </Link>

        {/* Stock Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">
                  {stock.symbol.slice(0, 3)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{stock.symbol}</h1>
                  <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">{stock.exchange}</span>
                </div>
                <p className="text-muted-foreground">{stock.name}</p>
                <p className="text-sm text-muted-foreground">{stock.sector}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {inWatchlist ? (
                  <>
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="text-sm font-medium">Watchlisted</span>
                  </>
                ) : (
                  <>
                    <StarOff className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-foreground">
                {stock.currency}{stock.price.toLocaleString()}
              </p>
              <div className={cn(
                "flex items-center gap-2 mt-1",
                isPositive ? "gain-text" : "loss-text"
              )}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
                <span className="text-muted-foreground text-sm">Today</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">52W High</p>
              <p className="font-semibold text-foreground">{stock.currency}{stock.high52w.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">52W Low</p>
              <p className="font-semibold text-foreground">{stock.currency}{stock.low52w.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="font-semibold text-foreground">{stock.marketCap}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="font-semibold text-foreground">{stock.volume}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">P/E Ratio</p>
              <p className="font-semibold text-foreground">{stock.pe.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">EPS</p>
              <p className="font-semibold text-foreground">{stock.currency}{stock.eps.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Dividend Yield</p>
              <p className="font-semibold text-foreground">{(stock.dividend * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sector</p>
              <p className="font-semibold text-foreground">{stock.sector}</p>
            </div>
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <StockChart stock={stock} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TradingPanel stock={stock} />
            <AIInsightsPanel stock={stock} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockDetail;
