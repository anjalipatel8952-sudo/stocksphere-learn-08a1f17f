import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Stock, indianStocks, globalStocks } from '@/data/mockStocks';
import { toast } from 'sonner';

export interface PortfolioItem {
  id: string;
  stock_symbol: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
}

export interface TransactionItem {
  id: string;
  stock_symbol: string;
  stock_name: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
}

export interface Holding {
  stock: Stock;
  quantity: number;
  avgPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

const allStocks = [...indianStocks, ...globalStocks];

export const usePortfolio = () => {
  const { user, wallet, refreshWallet } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setPortfolio(data as PortfolioItem[]);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setTransactions(data as TransactionItem[]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchPortfolio(), fetchTransactions()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, fetchPortfolio, fetchTransactions]);

  const buyStock = async (stock: Stock, quantity: number): Promise<boolean> => {
    if (!user || !wallet) return false;

    const totalCost = stock.price * quantity;
    
    // Check balance
    if (totalCost > wallet.balance) {
      toast.error('Insufficient balance');
      return false;
    }

    try {
      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - totalCost })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Check if already holding this stock
      const existingHolding = portfolio.find(p => p.stock_symbol === stock.symbol);

      if (existingHolding) {
        // Update existing holding
        const newQuantity = existingHolding.quantity + quantity;
        const newAvgPrice = ((existingHolding.avg_price * existingHolding.quantity) + totalCost) / newQuantity;

        const { error: portfolioError } = await supabase
          .from('portfolios')
          .update({ 
            quantity: newQuantity, 
            avg_price: newAvgPrice 
          })
          .eq('id', existingHolding.id);

        if (portfolioError) throw portfolioError;
      } else {
        // Create new holding
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            stock_symbol: stock.symbol,
            stock_name: stock.name,
            quantity,
            avg_price: stock.price
          });

        if (portfolioError) throw portfolioError;
      }

      // Record transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          stock_symbol: stock.symbol,
          stock_name: stock.name,
          transaction_type: 'buy',
          quantity,
          price: stock.price,
          total_amount: totalCost
        });

      if (txError) throw txError;

      // Refresh data
      await Promise.all([fetchPortfolio(), fetchTransactions(), refreshWallet()]);
      
      return true;
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Failed to complete purchase');
      return false;
    }
  };

  const sellStock = async (symbol: string, quantity: number): Promise<boolean> => {
    if (!user || !wallet) return false;

    const holding = portfolio.find(p => p.stock_symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      toast.error('Not enough shares to sell');
      return false;
    }

    const stock = allStocks.find(s => s.symbol === symbol);
    if (!stock) return false;

    const sellValue = stock.price * quantity;

    try {
      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance + sellValue })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      if (holding.quantity === quantity) {
        // Delete holding if selling all
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .delete()
          .eq('id', holding.id);

        if (portfolioError) throw portfolioError;
      } else {
        // Update quantity
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .update({ quantity: holding.quantity - quantity })
          .eq('id', holding.id);

        if (portfolioError) throw portfolioError;
      }

      // Record transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          stock_symbol: stock.symbol,
          stock_name: stock.name,
          transaction_type: 'sell',
          quantity,
          price: stock.price,
          total_amount: sellValue
        });

      if (txError) throw txError;

      // Refresh data
      await Promise.all([fetchPortfolio(), fetchTransactions(), refreshWallet()]);
      
      return true;
    } catch (error) {
      console.error('Sell error:', error);
      toast.error('Failed to complete sale');
      return false;
    }
  };

  // Convert portfolio items to holdings with current prices
  const holdings: Holding[] = portfolio.map(item => {
    const foundStock = allStocks.find(s => s.symbol === item.stock_symbol);
    if (!foundStock) {
      return null;
    }
    const stock = foundStock;
    
    const currentValue = stock.price * item.quantity;
    const investedValue = item.avg_price * item.quantity;
    const profitLoss = currentValue - investedValue;
    const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

    return {
      stock,
      quantity: item.quantity,
      avgPrice: item.avg_price,
      currentValue,
      profitLoss,
      profitLossPercent
    };
  }).filter((h): h is Holding => h !== null);

  const getHolding = (symbol: string) => {
    return holdings.find(h => h.stock.symbol === symbol);
  };

  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const investedValue = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const totalProfitLoss = portfolioValue - investedValue;
  const totalProfitLossPercent = investedValue > 0 ? (totalProfitLoss / investedValue) * 100 : 0;

  return {
    holdings,
    transactions,
    loading,
    buyStock,
    sellStock,
    getHolding,
    portfolioValue,
    totalProfitLoss,
    totalProfitLossPercent,
    refresh: () => Promise.all([fetchPortfolio(), fetchTransactions()])
  };
};
