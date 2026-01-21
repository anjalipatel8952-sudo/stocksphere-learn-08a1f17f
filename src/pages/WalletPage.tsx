import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

const WalletPage: React.FC = () => {
  const { wallet } = useAuth();
  const { transactions, portfolioValue, totalProfitLoss, totalProfitLossPercent } = usePortfolio();

  const totalValue = (wallet?.balance || 0) + portfolioValue;
  const initialBalance = 1000000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get recent wallet-affecting transactions
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your virtual trading balance
          </p>
        </motion.section>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-8 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">Available Balance</p>
          <p className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {formatCurrency(wallet?.balance || 0)}
          </p>
          <p className="text-sm text-muted-foreground">
            Ready to invest in stocks
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Invested Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              totalProfitLoss >= 0 ? "gain-text" : "loss-text"
            )}>
              {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
            </p>
            <p className={cn(
              "text-sm font-medium",
              totalProfitLossPercent >= 0 ? "gain-text" : "loss-text"
            )}>
              {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
            </p>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      tx.transaction_type === 'buy' ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {tx.transaction_type === 'buy' ? (
                        <ArrowDownRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.transaction_type === 'buy' ? 'Bought' : 'Sold'} {tx.quantity} {tx.stock_symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ ₹{Number(tx.price).toFixed(2)} per share
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      tx.transaction_type === 'buy' ? "loss-text" : "gain-text"
                    )}>
                      {tx.transaction_type === 'buy' ? '-' : '+'}{formatCurrency(Number(tx.total_amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { 
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

        {/* Demo Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          💡 This is virtual money for learning purposes. No real transactions are made.
        </motion.p>
      </div>
    </Layout>
  );
};

export default WalletPage;
