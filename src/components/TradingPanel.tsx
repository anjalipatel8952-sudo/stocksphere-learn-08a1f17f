import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Stock } from '@/data/mockStocks';
import { useTrading } from '@/context/TradingContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TradingPanelProps {
  stock: Stock;
}

const MINIMUM_INVESTMENT = 1000; // ₹1,000 minimum for beginners

const TradingPanel: React.FC<TradingPanelProps> = ({ stock }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [isProcessing, setIsProcessing] = useState(false);
  const { balance, buyStock, sellStock, getHolding } = useTrading();
  
  const holding = getHolding(stock.symbol);
  const totalCost = stock.price * quantity;
  
  // Calculate minimum quantity needed to meet ₹1,000 investment
  const minQuantityForInvestment = useMemo(() => {
    return Math.ceil(MINIMUM_INVESTMENT / stock.price);
  }, [stock.price]);
  
  const meetsMinimumInvestment = totalCost >= MINIMUM_INVESTMENT;
  const canBuy = balance >= totalCost && meetsMinimumInvestment;
  const canSell = holding && holding.quantity >= quantity;

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

  const handleBuy = async () => {
    if (!meetsMinimumInvestment) {
      toast.error('Minimum investment not met', {
        description: `As a beginner, you need to invest at least ₹1,000. Try buying ${minQuantityForInvestment} shares.`
      });
      return;
    }
    
    setIsProcessing(true);
    const success = await buyStock(stock, quantity);
    if (success) {
      toast.success(`Bought ${quantity} shares of ${stock.symbol}`, {
        description: `Total: ₹${totalCost.toLocaleString('en-IN')}`
      });
      setQuantity(1);
    }
    setIsProcessing(false);
  };

  const handleSell = async () => {
    setIsProcessing(true);
    const success = await sellStock(stock.symbol, quantity);
    if (success) {
      toast.success(`Sold ${quantity} shares of ${stock.symbol}`, {
        description: `Total: ₹${totalCost.toLocaleString('en-IN')}`
      });
      setQuantity(1);
    }
    setIsProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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

      {/* Beginner Investment Rule - Show when buying */}
      {activeTab === 'buy' && (
        <div className={cn(
          "p-3 rounded-lg mb-4 flex items-start gap-2",
          meetsMinimumInvestment ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"
        )}>
          <AlertCircle className={cn("w-4 h-4 mt-0.5", meetsMinimumInvestment ? "text-success" : "text-warning")} />
          <div className="text-sm">
            <p className={cn("font-medium", meetsMinimumInvestment ? "text-success" : "text-warning")}>
              {meetsMinimumInvestment ? '✓ Meets minimum investment' : 'Minimum ₹1,000 required'}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {meetsMinimumInvestment 
                ? 'Great! This order qualifies for our beginner-friendly trading.'
                : `Buy at least ${minQuantityForInvestment} shares to meet the ₹1,000 minimum for beginners.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Current Holdings */}
      {holding && (
        <div className="p-3 bg-secondary/50 rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Holdings</span>
            <span className="font-medium">{holding.quantity} shares</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Avg. Price</span>
            <span className="font-medium">₹{holding.avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">P&L</span>
            <span className={cn(
              "font-medium",
              holding.profitLoss >= 0 ? "gain-text" : "loss-text"
            )}>
              {holding.profitLoss >= 0 ? '+' : ''}₹{holding.profitLoss.toFixed(2)} ({holding.profitLossPercent.toFixed(2)}%)
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
            disabled={isProcessing}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isProcessing}
            className="flex-1 h-10 text-center bg-secondary rounded-lg border-0 text-foreground font-medium focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={isProcessing}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Set Buttons for Minimum */}
        {activeTab === 'buy' && !meetsMinimumInvestment && (
          <button
            onClick={() => setQuantity(minQuantityForInvestment)}
            className="mt-2 w-full text-xs py-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
          >
            Set to minimum: {minQuantityForInvestment} shares
          </button>
        )}
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
          disabled={!canBuy || isProcessing}
          className={cn(
            "w-full bg-success hover:bg-success/90 text-success-foreground",
            (!canBuy || isProcessing) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !meetsMinimumInvestment ? (
            `Need ₹${MINIMUM_INVESTMENT.toLocaleString()} Min`
          ) : canBuy ? (
            `Buy ${quantity} Share${quantity > 1 ? 's' : ''}`
          ) : (
            'Insufficient Balance'
          )}
        </Button>
      ) : (
        <Button
          onClick={handleSell}
          disabled={!canSell || isProcessing}
          className={cn(
            "w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            (!canSell || isProcessing) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : canSell ? (
            `Sell ${quantity} Share${quantity > 1 ? 's' : ''}`
          ) : (
            'No Shares to Sell'
          )}
        </Button>
      )}

      {/* Balance Info */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Available Balance: {formatCurrency(balance)}
      </p>
      
      {/* Virtual Money Notice */}
      <p className="text-xs text-center mt-2 text-primary/70">
        🎓 All trading uses virtual money for learning
      </p>
    </motion.div>
  );
};

export default TradingPanel;
