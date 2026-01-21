import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, TrendingUp, TrendingDown, Wallet, History, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTrading } from '@/context/TradingContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Portfolio: React.FC = () => {
  const { wallet } = useAuth();
  const { 
    balance, 
    holdings, 
    transactions, 
    portfolioValue, 
    totalProfitLoss, 
    totalProfitLossPercent,
    loading 
  } = useTrading();

  const totalValue = balance + portfolioValue;
  const initialBalance = wallet?.balance ? wallet.balance + portfolioValue : 1000000;
  const overallPL = totalProfitLoss;
  const overallPLPercent = totalProfitLossPercent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
            Your Portfolio
          </h1>
          <p className="text-muted-foreground">
            Track your virtual investments and performance
          </p>
        </motion.section>

        {/* Portfolio Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Portfolio + Cash
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Invested Value</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {holdings.length} stock{holdings.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              overallPL >= 0 ? "gain-text" : "loss-text"
            )}>
              {overallPL >= 0 ? '+' : ''}{formatCurrency(overallPL)}
            </p>
            <p className={cn(
              "text-sm font-medium mt-1",
              overallPLPercent >= 0 ? "gain-text" : "loss-text"
            )}>
              {overallPLPercent >= 0 ? '+' : ''}{overallPLPercent.toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Cash Balance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(balance)}</p>
            <p className="text-sm text-muted-foreground mt-1">Available to invest</p>
          </motion.div>
        </div>

        {/* Holdings Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Holdings</h2>
          
          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No stocks in your portfolio yet</p>
              <Link 
                to="/stocks"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Stocks
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Avg. Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Current</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.stock.symbol} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-2">
                        <Link to={`/stock/${holding.stock.symbol}`} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {holding.stock.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {holding.stock.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">{holding.stock.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="text-right py-3 px-2 font-medium">{holding.quantity}</td>
                      <td className="text-right py-3 px-2">{holding.stock.currency}{holding.avgPrice.toFixed(2)}</td>
                      <td className="text-right py-3 px-2">{holding.stock.currency}{holding.stock.price.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 font-medium">{formatCurrency(holding.currentValue)}</td>
                      <td className={cn(
                        "text-right py-3 px-2 font-medium",
                        holding.profitLoss >= 0 ? "gain-text" : "loss-text"
                      )}>
                        <div className="flex items-center justify-end gap-1">
                          {holding.profitLoss >= 0 ? '+' : ''}{holding.stock.currency}{holding.profitLoss.toFixed(2)}
                          <span className="text-xs">({holding.profitLossPercent.toFixed(2)}%)</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            </div>
            {transactions.length > 0 && (
              <Link to="/transactions" className="text-sm text-primary hover:underline">
                View All
              </Link>
            )}
          </div>

          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      tx.type === 'buy' ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {tx.type === 'buy' ? (
                        <ArrowDownRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.quantity} {tx.stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ {tx.stock.currency}{tx.price.toFixed(2)} per share
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      tx.type === 'buy' ? "loss-text" : "gain-text"
                    )}>
                      {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.timestamp.toLocaleDateString('en-IN', { 
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  );
};

export default Portfolio;
