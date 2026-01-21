import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, TrendingUp } from 'lucide-react';
import { Stock } from '@/data/mockStocks';
import { useTrading } from '@/context/TradingContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TradingPanelProps {
  stock: Stock;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ stock }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const { balance, buyStock, sellStock, getHolding } = useTrading();
  
  const holding = getHolding(stock.symbol);
  const totalCost = stock.price * quantity;
  const canBuy = balance >= totalCost;
  const canSell = holding && holding.quantity >= quantity;

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

  const handleBuy = () => {
    if (buyStock(stock, quantity)) {
      toast.success(`Bought ${quantity} shares of ${stock.symbol}`, {
        description: `Total: ${stock.currency}${totalCost.toLocaleString()}`
      });
      setQuantity(1);
    } else {
      toast.error('Insufficient balance');
    }
  };

  const handleSell = () => {
    if (sellStock(stock.symbol, quantity)) {
      toast.success(`Sold ${quantity} shares of ${stock.symbol}`, {
        description: `Total: ${stock.currency}${totalCost.toLocaleString()}`
      });
      setQuantity(1);
    } else {
      toast.error('Not enough shares to sell');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: stock.currency === '₹' ? 'INR' : 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="font-semibold text-foreground mb-4">Virtual Trading</h3>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-4">
        <button
          onClick={() => setActiveTab('buy')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
            activeTab === 'buy'
              ? "bg-success text-success-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
            activeTab === 'sell'
              ? "bg-destructive text-destructive-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Sell
        </button>
      </div>

      {/* Current Holdings */}
      {holding && (
        <div className="p-3 bg-secondary/50 rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Holdings</span>
            <span className="font-medium">{holding.quantity} shares</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Avg. Price</span>
            <span className="font-medium">{stock.currency}{holding.avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">P&L</span>
            <span className={cn(
              "font-medium",
              holding.profitLoss >= 0 ? "gain-text" : "loss-text"
            )}>
              {holding.profitLoss >= 0 ? '+' : ''}{stock.currency}{holding.profitLoss.toFixed(2)} ({holding.profitLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 h-10 text-center bg-secondary rounded-lg border-0 text-foreground font-medium focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="space-y-2 mb-4 p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Price per share</span>
          <span className="font-medium">{formatCurrency(stock.price)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-medium">× {quantity}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</span>
        </div>
      </div>

      {/* Action Button */}
      {activeTab === 'buy' ? (
        <Button
          onClick={handleBuy}
          disabled={!canBuy}
          className={cn(
            "w-full bg-success hover:bg-success/90 text-success-foreground",
            !canBuy && "opacity-50 cursor-not-allowed"
          )}
        >
          {canBuy ? `Buy ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Balance'}
        </Button>
      ) : (
        <Button
          onClick={handleSell}
          disabled={!canSell}
          className={cn(
            "w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            !canSell && "opacity-50 cursor-not-allowed"
          )}
        >
          {canSell ? `Sell ${quantity} Share${quantity > 1 ? 's' : ''}` : 'No Shares to Sell'}
        </Button>
      )}

      {/* Balance Info */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Available Balance: {formatCurrency(balance)}
      </p>
    </motion.div>
  );
};

export default TradingPanel;
