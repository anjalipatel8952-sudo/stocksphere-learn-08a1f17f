import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Stock, indianStocks, globalStocks } from '@/data/mockStocks';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Holding {
  stock: Stock;
  quantity: number;
  avgPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  stock: Stock;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface TradingContextType {
  balance: number;
  holdings: Holding[];
  watchlist: Stock[];
  transactions: Transaction[];
  portfolioValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  loading: boolean;
  buyStock: (stock: Stock, quantity: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number) => Promise<boolean>;
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  getHolding: (symbol: string) => Holding | undefined;
  refresh: () => Promise<void>;
}

const allStocks = [...indianStocks, ...globalStocks];

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const balance = wallet?.balance ?? 0;

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      const holdingsData: Holding[] = data
        .map(item => {
          const foundStock = allStocks.find(s => s.symbol === item.stock_symbol);
          if (!foundStock) return null;
          
          const currentValue = foundStock.price * item.quantity;
          const investedValue = Number(item.avg_price) * item.quantity;
          const profitLoss = currentValue - investedValue;
          const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

          return {
            stock: foundStock,
            quantity: item.quantity,
            avgPrice: Number(item.avg_price),
            currentValue,
            profitLoss,
            profitLossPercent
          };
        })
        .filter((h): h is Holding => h !== null);
      
      setHoldings(holdingsData);
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
      const txData: Transaction[] = data
        .map(item => {
          const foundStock = allStocks.find(s => s.symbol === item.stock_symbol);
          if (!foundStock) return null;
          
          return {
            id: item.id,
            type: item.transaction_type as 'buy' | 'sell',
            stock: foundStock,
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.total_amount),
            timestamp: new Date(item.created_at)
          };
        })
        .filter((t): t is Transaction => t !== null);
      
      setTransactions(txData);
    }
  }, [user]);

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stocksphere_watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('stocksphere_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchPortfolio(), fetchTransactions()]).finally(() => {
        setLoading(false);
      });
    } else {
      setHoldings([]);
      setTransactions([]);
    }
  }, [user, fetchPortfolio, fetchTransactions]);

  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const investedValue = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const totalProfitLoss = portfolioValue - investedValue;
  const totalProfitLossPercent = investedValue > 0 ? (totalProfitLoss / investedValue) * 100 : 0;

  const buyStock = async (stock: Stock, quantity: number): Promise<boolean> => {
    if (!user || !wallet) {
      toast.error('Please log in to trade');
      return false;
    }

    const totalCost = stock.price * quantity;
    
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
      const existingHolding = holdings.find(h => h.stock.symbol === stock.symbol);

      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + totalCost) / newQuantity;

        const { error: portfolioError } = await supabase
          .from('portfolios')
          .update({ 
            quantity: newQuantity, 
            avg_price: newAvgPrice 
          })
          .eq('user_id', user.id)
          .eq('stock_symbol', stock.symbol);

        if (portfolioError) throw portfolioError;
      } else {
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
    if (!user || !wallet) {
      toast.error('Please log in to trade');
      return false;
    }

    const holding = holdings.find(h => h.stock.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      toast.error('Not enough shares to sell');
      return false;
    }

    const sellValue = holding.stock.price * quantity;

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
          .eq('user_id', user.id)
          .eq('stock_symbol', symbol);

        if (portfolioError) throw portfolioError;
      } else {
        // Update quantity
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .update({ quantity: holding.quantity - quantity })
          .eq('user_id', user.id)
          .eq('stock_symbol', symbol);

        if (portfolioError) throw portfolioError;
      }

      // Record transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          stock_symbol: holding.stock.symbol,
          stock_name: holding.stock.name,
          transaction_type: 'sell',
          quantity,
          price: holding.stock.price,
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

  const addToWatchlist = (stock: Stock) => {
    if (!watchlist.find(s => s.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s.symbol !== symbol));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(s => s.symbol === symbol);
  };

  const getHolding = (symbol: string) => {
    return holdings.find(h => h.stock.symbol === symbol);
  };

  const refresh = async () => {
    await Promise.all([fetchPortfolio(), fetchTransactions(), refreshWallet()]);
  };

  return (
    <TradingContext.Provider value={{
      balance,
      holdings,
      watchlist,
      transactions,
      portfolioValue,
      totalProfitLoss,
      totalProfitLossPercent,
      loading,
      buyStock,
      sellStock,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      getHolding,
      refresh
    }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
