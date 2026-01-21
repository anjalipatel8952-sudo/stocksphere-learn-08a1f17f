import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stock } from '@/data/mockStocks';

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
  buyStock: (stock: Stock, quantity: number) => boolean;
  sellStock: (symbol: string, quantity: number) => boolean;
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  getHolding: (symbol: string) => Holding | undefined;
}

const INITIAL_BALANCE = 1000000; // ₹10,00,000

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBalance = localStorage.getItem('stocksphere_balance');
    const savedHoldings = localStorage.getItem('stocksphere_holdings');
    const savedWatchlist = localStorage.getItem('stocksphere_watchlist');
    const savedTransactions = localStorage.getItem('stocksphere_transactions');

    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedHoldings) setHoldings(JSON.parse(savedHoldings));
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedTransactions) {
      const txs = JSON.parse(savedTransactions);
      setTransactions(txs.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) })));
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('stocksphere_balance', balance.toString());
    localStorage.setItem('stocksphere_holdings', JSON.stringify(holdings));
    localStorage.setItem('stocksphere_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('stocksphere_transactions', JSON.stringify(transactions));
  }, [balance, holdings, watchlist, transactions]);

  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const investedValue = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const totalProfitLoss = portfolioValue - investedValue;
  const totalProfitLossPercent = investedValue > 0 ? (totalProfitLoss / investedValue) * 100 : 0;

  const buyStock = (stock: Stock, quantity: number): boolean => {
    const totalCost = stock.price * quantity;
    if (totalCost > balance) return false;

    const existingHolding = holdings.find(h => h.stock.symbol === stock.symbol);
    
    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + totalCost) / newQuantity;
      const currentValue = stock.price * newQuantity;
      const profitLoss = currentValue - (newAvgPrice * newQuantity);
      
      setHoldings(holdings.map(h => 
        h.stock.symbol === stock.symbol 
          ? { 
              ...h, 
              quantity: newQuantity, 
              avgPrice: newAvgPrice,
              currentValue,
              profitLoss,
              profitLossPercent: (profitLoss / (newAvgPrice * newQuantity)) * 100
            }
          : h
      ));
    } else {
      const newHolding: Holding = {
        stock,
        quantity,
        avgPrice: stock.price,
        currentValue: stock.price * quantity,
        profitLoss: 0,
        profitLossPercent: 0
      };
      setHoldings([...holdings, newHolding]);
    }

    setBalance(balance - totalCost);
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'buy',
      stock,
      quantity,
      price: stock.price,
      total: totalCost,
      timestamp: new Date()
    };
    setTransactions([transaction, ...transactions]);

    return true;
  };

  const sellStock = (symbol: string, quantity: number): boolean => {
    const holding = holdings.find(h => h.stock.symbol === symbol);
    if (!holding || holding.quantity < quantity) return false;

    const sellValue = holding.stock.price * quantity;
    
    if (holding.quantity === quantity) {
      setHoldings(holdings.filter(h => h.stock.symbol !== symbol));
    } else {
      const newQuantity = holding.quantity - quantity;
      const currentValue = holding.stock.price * newQuantity;
      const profitLoss = currentValue - (holding.avgPrice * newQuantity);
      
      setHoldings(holdings.map(h => 
        h.stock.symbol === symbol 
          ? { 
              ...h, 
              quantity: newQuantity,
              currentValue,
              profitLoss,
              profitLossPercent: (profitLoss / (holding.avgPrice * newQuantity)) * 100
            }
          : h
      ));
    }

    setBalance(balance + sellValue);

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'sell',
      stock: holding.stock,
      quantity,
      price: holding.stock.price,
      total: sellValue,
      timestamp: new Date()
    };
    setTransactions([transaction, ...transactions]);

    return true;
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

  return (
    <TradingContext.Provider value={{
      balance,
      holdings,
      watchlist,
      transactions,
      portfolioValue,
      totalProfitLoss,
      totalProfitLossPercent,
      buyStock,
      sellStock,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      getHolding
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
