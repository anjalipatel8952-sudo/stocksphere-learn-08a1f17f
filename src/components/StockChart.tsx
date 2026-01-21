import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Stock } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

interface StockChartProps {
  stock: Stock;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  const chartData = useMemo(() => {
    const history = stock.priceHistory;
    const now = new Date();
    
    let daysToShow: number;
    switch (timeRange) {
      case '1D': daysToShow = 1; break;
      case '1W': daysToShow = 7; break;
      case '1M': daysToShow = 30; break;
      case '3M': daysToShow = 90; break;
      case '1Y': daysToShow = 365; break;
      default: daysToShow = 30;
    }

    return history.slice(-daysToShow).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      }),
      price: item.price,
      fullDate: item.date
    }));
  }, [stock.priceHistory, timeRange]);

  const isPositive = chartData.length > 1 
    ? chartData[chartData.length - 1].price >= chartData[0].price 
    : true;

  const minPrice = Math.min(...chartData.map(d => d.price)) * 0.995;
  const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.005;

  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Price Chart</h3>
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} 
                  stopOpacity={0.3} 
                />
                <stop 
                  offset="100%" 
                  stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} 
                  stopOpacity={0} 
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `${stock.currency}${value.toFixed(0)}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${stock.currency}${value.toFixed(2)}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"}
              strokeWidth={2}
              fill={`url(#gradient-${stock.symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StockChart;
