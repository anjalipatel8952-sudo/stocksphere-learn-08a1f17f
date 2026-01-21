import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '@/components/Layout';
import { allStocks, Stock } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(173, 80%, 50%)',
  'hsl(142, 76%, 46%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)'
];

const Compare: React.FC = () => {
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStocks = allStocks.filter(
    stock => 
      !selectedStocks.find(s => s.symbol === stock.symbol) &&
      (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
       stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addStock = (stock: Stock) => {
    if (selectedStocks.length < 5) {
      setSelectedStocks([...selectedStocks, stock]);
      setSearchQuery('');
    }
  };

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s.symbol !== symbol));
  };

  // Normalize price data for comparison (percentage change from start)
  const chartData = React.useMemo(() => {
    if (selectedStocks.length === 0) return [];

    const minLength = Math.min(...selectedStocks.map(s => s.priceHistory.length));
    const data: any[] = [];

    for (let i = 0; i < Math.min(minLength, 30); i++) {
      const point: any = { 
        date: selectedStocks[0].priceHistory[selectedStocks[0].priceHistory.length - 30 + i]?.date 
      };
      
      selectedStocks.forEach((stock) => {
        const history = stock.priceHistory;
        const startPrice = history[history.length - 30]?.price || history[0].price;
        const currentPrice = history[history.length - 30 + i]?.price || startPrice;
        const percentChange = ((currentPrice - startPrice) / startPrice) * 100;
        point[stock.symbol] = percentChange;
      });
      
      data.push(point);
    }

    return data;
  }, [selectedStocks]);

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
            Compare Stocks
          </h1>
          <p className="text-muted-foreground">
            Compare up to 5 stocks side by side
          </p>
        </motion.section>

        {/* Stock Selector */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5 mb-6"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {selectedStocks.map((stock, index) => (
              <div 
                key={stock.symbol}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary"
                style={{ borderLeft: `3px solid ${CHART_COLORS[index]}` }}
              >
                <span className="font-medium">{stock.symbol}</span>
                <button 
                  onClick={() => removeStock(stock.symbol)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
            
            {selectedStocks.length < 5 && (
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Add stock to compare..."
                  className="w-full px-4 py-2 bg-secondary rounded-lg border-0 outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
                
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg overflow-hidden z-20 max-h-60 overflow-y-auto">
                    {filteredStocks.slice(0, 5).map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => addStock(stock)}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {5 - selectedStocks.length} slot{5 - selectedStocks.length !== 1 ? 's' : ''} remaining
          </p>
        </motion.section>

        {selectedStocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Select stocks to compare</h2>
            <p className="text-muted-foreground">
              Add stocks using the search box above to see their performance comparison
            </p>
          </motion.div>
        ) : (
          <>
            {/* Comparison Chart */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-5 mb-6"
            >
              <h3 className="font-semibold text-foreground mb-4">30-Day Performance (% Change)</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                    />
                    <Legend />
                    {selectedStocks.map((stock, index) => (
                      <Line
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* Comparison Table */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">Key Metrics Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Metric</th>
                      {selectedStocks.map((stock, index) => (
                        <th 
                          key={stock.symbol} 
                          className="text-right py-3 px-2 text-sm font-medium"
                          style={{ color: CHART_COLORS[index] }}
                        >
                          {stock.symbol}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">Price</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {stock.currency}{stock.price.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">Today's Change</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className={cn(
                          "text-right py-3 px-2 font-medium",
                          stock.change >= 0 ? "gain-text" : "loss-text"
                        )}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">Market Cap</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {stock.marketCap}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">P/E Ratio</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {stock.pe.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">52W High</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {stock.currency}{stock.high52w.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-muted-foreground">52W Low</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {stock.currency}{stock.low52w.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-sm text-muted-foreground">Dividend Yield</td>
                      {selectedStocks.map((stock) => (
                        <td key={stock.symbol} className="text-right py-3 px-2 font-medium">
                          {(stock.dividend * 100).toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Compare;
