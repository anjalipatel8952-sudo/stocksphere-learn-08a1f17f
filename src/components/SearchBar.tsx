import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allStocks, Stock } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allStocks.filter(
      stock => 
        stock.symbol.toLowerCase().includes(q) || 
        stock.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const handleSelect = () => {
    setQuery('');
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-card",
        isFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
      )}>
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search stocks by name or symbol..."
          className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="p-1 rounded-full hover:bg-secondary"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden shadow-xl z-50"
        >
          {results.map((stock, index) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              onClick={handleSelect}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {stock.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {stock.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {stock.currency}{stock.price.toLocaleString()}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    stock.change >= 0 ? "gain-text" : "loss-text"
                  )}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
