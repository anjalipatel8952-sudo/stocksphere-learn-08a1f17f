import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { Stock, getAIInsight } from '@/data/mockStocks';
import { useTrading } from '@/context/TradingContext';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: Stock;
  delay?: number;
  showAI?: boolean;
  compact?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, delay = 0, showAI = false, compact = false }) => {
  const isPositive = stock.change >= 0;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useTrading();
  const inWatchlist = isInWatchlist(stock.symbol);
  const aiInsight = showAI ? getAIInsight(stock) : null;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock);
    }
  };

  if (compact) {
    return (
      <Link to={`/stock/${stock.symbol}`}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay, duration: 0.3 }}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{stock.currency}{stock.price.toLocaleString()}</p>
            <p className={cn(
              "text-xs font-medium",
              isPositive ? "gain-text" : "loss-text"
            )}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/stock/${stock.symbol}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-card rounded-xl p-5 hover-lift cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{stock.symbol.slice(0, 3)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
            </div>
          </div>
          <button
            onClick={handleWatchlistToggle}
            className="p-2 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
          >
            {inWatchlist ? (
              <Star className="w-5 h-5 text-warning fill-warning" />
            ) : (
              <StarOff className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stock.currency}{stock.price.toLocaleString()}
            </p>
            <div className={cn(
              "flex items-center gap-1 mt-1",
              isPositive ? "gain-text" : "loss-text"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {showAI && aiInsight && (
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold",
              aiInsight.recommendation === 'Buy' && "bg-success/10 text-success",
              aiInsight.recommendation === 'Hold' && "bg-warning/10 text-warning",
              aiInsight.recommendation === 'Sell' && "bg-destructive/10 text-destructive"
            )}>
              {aiInsight.recommendation}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{stock.exchange}</span>
          <span className="text-xs text-muted-foreground">Vol: {stock.volume}</span>
        </div>
      </motion.div>
    </Link>
  );
};

export default StockCard;
