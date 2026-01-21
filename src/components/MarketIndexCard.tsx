import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketIndex } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

interface MarketIndexCardProps {
  index: MarketIndex;
  delay?: number;
}

const MarketIndexCard: React.FC<MarketIndexCardProps> = ({ index, delay = 0 }) => {
  const isPositive = index.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-xl p-4 hover-lift cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">{index.country}</span>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          isPositive ? "gain-bg" : "loss-bg"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-1">{index.name}</h3>
      <p className="text-2xl font-bold text-foreground">
        {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </p>
      <p className={cn(
        "text-sm font-medium mt-1",
        isPositive ? "gain-text" : "loss-text"
      )}>
        {isPositive ? '+' : ''}{index.change.toFixed(2)}
      </p>
    </motion.div>
  );
};

export default MarketIndexCard;
