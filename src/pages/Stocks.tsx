import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import StockCard from '@/components/StockCard';
import { allStocks, indianStocks, globalStocks } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'indian' | 'global';
type SortType = 'name' | 'price' | 'change';

const Stocks: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredStocks = React.useMemo(() => {
    let stocks = filter === 'all' ? allStocks : filter === 'indian' ? indianStocks : globalStocks;
    
    return [...stocks].sort((a, b) => {
      switch (sortBy) {
        case 'price': return b.price - a.price;
        case 'change': return b.changePercent - a.changePercent;
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [filter, sortBy]);

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
            Browse Indian and global stocks with AI-powered insights
          </p>
        </motion.section>

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

        {/* Results Count */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          Showing {filteredStocks.length} stocks
        </p>
      </div>
    </Layout>
  );
};

export default Stocks;
