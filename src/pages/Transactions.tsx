import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useTrading } from '@/context/TradingContext';
import { cn } from '@/lib/utils';

const Transactions: React.FC = () => {
  const { transactions, loading } = useTrading();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          tx.stock.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalBought = transactions
    .filter(tx => tx.type === 'buy')
    .reduce((sum, tx) => sum + tx.total, 0);

  const totalSold = transactions
    .filter(tx => tx.type === 'sell')
    .reduce((sum, tx) => sum + tx.total, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View all your trading activity
          </p>
        </motion.section>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Bought</p>
            <p className="text-2xl font-bold loss-text">{formatCurrency(totalBought)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Sold</p>
            <p className="text-2xl font-bold gain-text">{formatCurrency(totalSold)}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by stock symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                filter === 'all' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('buy')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                filter === 'buy' 
                  ? "bg-success text-success-foreground" 
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Buy
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                filter === 'sell' 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Sell
            </button>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              All Transactions ({filteredTransactions.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search || filter !== 'all' ? 'No matching transactions found' : 'No transactions yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      tx.type === 'buy' ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {tx.type === 'buy' ? (
                        <ArrowDownRight className="w-6 h-6 text-success" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{tx.stock.symbol}</p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          tx.type === 'buy' 
                            ? "bg-success/10 text-success" 
                            : "bg-destructive/10 text-destructive"
                        )}>
                          {tx.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tx.stock.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.quantity} shares @ ₹{tx.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      tx.type === 'buy' ? "loss-text" : "gain-text"
                    )}>
                      {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.timestamp.toLocaleDateString('en-IN', { 
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  );
};

export default Transactions;
