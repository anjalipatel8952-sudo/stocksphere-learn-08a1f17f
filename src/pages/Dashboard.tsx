import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Newspaper, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import MarketIndexCard from '@/components/MarketIndexCard';
import StockCard from '@/components/StockCard';
import NewsCard from '@/components/NewsCard';
import { 
  marketIndices, 
  stockNews, 
  getTopGainers, 
  getTopLosers, 
  getMostActive 
} from '@/data/mockStocks';

const Dashboard: React.FC = () => {
  const topGainers = getTopGainers();
  const topLosers = getTopLosers();
  const mostActive = getMostActive();

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
            <div className="space-y-1">
              {topGainers.map((stock, i) => (
                <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
              ))}
            </div>
          </section>

          {/* Top Losers */}
          <section className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <h2 className="font-semibold text-foreground">Top Losers</h2>
            </div>
            <div className="space-y-1">
              {topLosers.map((stock, i) => (
                <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
              ))}
            </div>
          </section>

          {/* Most Active */}
          <section className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Most Active</h2>
            </div>
            <div className="space-y-1">
              {mostActive.map((stock, i) => (
                <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} compact />
              ))}
            </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topGainers.slice(0, 4).map((stock, i) => (
              <StockCard key={stock.symbol} stock={stock} delay={i * 0.05} showAI />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
