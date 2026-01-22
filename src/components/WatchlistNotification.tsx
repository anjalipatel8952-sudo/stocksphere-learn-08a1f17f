import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Bell } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { useStockData } from '@/context/StockDataContext';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  symbol: string;
  name: string;
  change: number;
  changePercent: number;
  priceChange: number;
  type: 'profit' | 'loss';
  timestamp: Date;
}

const WatchlistNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const { watchlist } = useTrading();
  const { stocks, lastUpdated } = useStockData();

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Limit to 5 notifications
      const updated = [notification, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Check for price changes in watchlist
  useEffect(() => {
    if (!lastUpdated || stocks.length === 0) return;

    watchlist.forEach(watchItem => {
      const currentStock = stocks.find(s => s.symbol === watchItem.symbol);
      if (!currentStock) return;

      const prevPrice = previousPrices[watchItem.symbol];
      if (prevPrice === undefined) {
        setPreviousPrices(prev => ({ ...prev, [watchItem.symbol]: currentStock.price }));
        return;
      }

      const priceChange = currentStock.price - prevPrice;
      const changeThreshold = prevPrice * 0.01; // 1% threshold

      if (Math.abs(priceChange) >= changeThreshold) {
        const isProfit = priceChange > 0;
        addNotification({
          id: `${watchItem.symbol}-${Date.now()}`,
          symbol: watchItem.symbol,
          name: currentStock.name,
          change: currentStock.change,
          changePercent: currentStock.changePercent,
          priceChange,
          type: isProfit ? 'profit' : 'loss',
          timestamp: new Date(),
        });

        setPreviousPrices(prev => ({ ...prev, [watchItem.symbol]: currentStock.price }));
      }
    });
  }, [stocks, lastUpdated, watchlist, previousPrices, addNotification]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "glass-card rounded-xl p-4 shadow-xl border-l-4",
              notification.type === 'profit' 
                ? "border-l-success bg-success/5" 
                : "border-l-destructive bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                notification.type === 'profit' ? "bg-success/20" : "bg-destructive/20"
              )}>
                {notification.type === 'profit' ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Watchlist Alert</span>
                </div>
                
                <h4 className="font-semibold text-foreground truncate">
                  {notification.symbol}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {notification.name}
                </p>
                
                <div className={cn(
                  "flex items-center gap-2 mt-1 text-sm font-medium",
                  notification.type === 'profit' ? "text-success" : "text-destructive"
                )}>
                  <span>{notification.priceChange > 0 ? '+' : ''}{formatCurrency(notification.priceChange)}</span>
                  <span>({notification.changePercent > 0 ? '+' : ''}{notification.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WatchlistNotification;
