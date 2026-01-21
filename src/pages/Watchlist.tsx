import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import StockCard from '@/components/StockCard';
import { useTrading } from '@/context/TradingContext';

const Watchlist: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useTrading();

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
            Your Watchlist
          </h1>
          <p className="text-muted-foreground">
            Track your favorite stocks in one place
          </p>
        </motion.section>

        {watchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add stocks to your watchlist to track them easily
            </p>
            <Link 
              to="/stocks"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Browse Stocks
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchlist.map((stock, i) => (
              <div key={stock.symbol} className="relative group">
                <StockCard stock={stock} delay={i * 0.05} showAI />
                <button
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  className="absolute top-3 right-3 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watchlist;
