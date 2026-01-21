export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  sector: string;
  exchange: string;
  currency: string;
  high52w: number;
  low52w: number;
  pe: number;
  eps: number;
  dividend: number;
  priceHistory: { date: string; price: number }[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  country: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedStocks: string[];
}

const generatePriceHistory = (basePrice: number, days: number = 365): { date: string; price: number }[] => {
  const history: { date: string; price: number }[] = [];
  let currentPrice = basePrice * (0.7 + Math.random() * 0.3);
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const volatility = (Math.random() - 0.48) * 0.04;
    currentPrice = currentPrice * (1 + volatility);
    currentPrice = Math.max(currentPrice, basePrice * 0.5);
    currentPrice = Math.min(currentPrice, basePrice * 1.5);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(currentPrice.toFixed(2))
    });
  }

  return history;
};

export const indianStocks: Stock[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2847.50,
    change: 45.30,
    changePercent: 1.62,
    volume: "12.5M",
    marketCap: "₹19.3L Cr",
    sector: "Energy",
    exchange: "NSE",
    currency: "₹",
    high52w: 3024.90,
    low52w: 2220.30,
    pe: 28.5,
    eps: 99.91,
    dividend: 0.35,
    priceHistory: generatePriceHistory(2847.50)
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 4123.75,
    change: -32.45,
    changePercent: -0.78,
    volume: "3.2M",
    marketCap: "₹15.1L Cr",
    sector: "IT",
    exchange: "NSE",
    currency: "₹",
    high52w: 4592.25,
    low52w: 3311.05,
    pe: 31.2,
    eps: 132.17,
    dividend: 1.12,
    priceHistory: generatePriceHistory(4123.75)
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1689.20,
    change: 23.80,
    changePercent: 1.43,
    volume: "8.7M",
    marketCap: "₹12.9L Cr",
    sector: "Banking",
    exchange: "NSE",
    currency: "₹",
    high52w: 1794.00,
    low52w: 1363.55,
    pe: 19.8,
    eps: 85.31,
    dividend: 0.95,
    priceHistory: generatePriceHistory(1689.20)
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1834.55,
    change: 28.90,
    changePercent: 1.60,
    volume: "5.4M",
    marketCap: "₹7.6L Cr",
    sector: "IT",
    exchange: "NSE",
    currency: "₹",
    high52w: 1953.90,
    low52w: 1358.35,
    pe: 27.3,
    eps: 67.20,
    dividend: 1.45,
    priceHistory: generatePriceHistory(1834.55)
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 1245.60,
    change: -8.75,
    changePercent: -0.70,
    volume: "6.1M",
    marketCap: "₹8.8L Cr",
    sector: "Banking",
    exchange: "NSE",
    currency: "₹",
    high52w: 1311.80,
    low52w: 894.70,
    pe: 18.9,
    eps: 65.90,
    dividend: 0.80,
    priceHistory: generatePriceHistory(1245.60)
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    price: 2456.80,
    change: 12.35,
    changePercent: 0.51,
    volume: "1.8M",
    marketCap: "₹5.8L Cr",
    sector: "FMCG",
    exchange: "NSE",
    currency: "₹",
    high52w: 2859.30,
    low52w: 2172.05,
    pe: 58.2,
    eps: 42.21,
    dividend: 1.82,
    priceHistory: generatePriceHistory(2456.80)
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    price: 1567.90,
    change: 34.20,
    changePercent: 2.23,
    volume: "4.2M",
    marketCap: "₹9.4L Cr",
    sector: "Telecom",
    exchange: "NSE",
    currency: "₹",
    high52w: 1778.95,
    low52w: 1098.20,
    pe: 72.5,
    eps: 21.62,
    dividend: 0.25,
    priceHistory: generatePriceHistory(1567.90)
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 823.45,
    change: -5.60,
    changePercent: -0.68,
    volume: "15.3M",
    marketCap: "₹7.4L Cr",
    sector: "Banking",
    exchange: "NSE",
    currency: "₹",
    high52w: 912.10,
    low52w: 555.25,
    pe: 11.2,
    eps: 73.52,
    dividend: 1.42,
    priceHistory: generatePriceHistory(823.45)
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    price: 467.25,
    change: 8.90,
    changePercent: 1.94,
    volume: "7.8M",
    marketCap: "₹2.4L Cr",
    sector: "IT",
    exchange: "NSE",
    currency: "₹",
    high52w: 526.85,
    low52w: 390.40,
    pe: 21.8,
    eps: 21.43,
    dividend: 0.21,
    priceHistory: generatePriceHistory(467.25)
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    price: 987.65,
    change: 42.30,
    changePercent: 4.48,
    volume: "22.1M",
    marketCap: "₹3.6L Cr",
    sector: "Auto",
    exchange: "NSE",
    currency: "₹",
    high52w: 1069.85,
    low52w: 595.50,
    pe: 8.9,
    eps: 110.97,
    dividend: 0.0,
    priceHistory: generatePriceHistory(987.65)
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India Ltd",
    price: 12456.80,
    change: -156.40,
    changePercent: -1.24,
    volume: "0.9M",
    marketCap: "₹3.9L Cr",
    sector: "Auto",
    exchange: "NSE",
    currency: "₹",
    high52w: 13680.00,
    low52w: 9737.65,
    pe: 32.1,
    eps: 388.06,
    dividend: 0.73,
    priceHistory: generatePriceHistory(12456.80)
  },
  {
    symbol: "AXISBANK",
    name: "Axis Bank Ltd",
    price: 1178.90,
    change: 18.65,
    changePercent: 1.61,
    volume: "9.2M",
    marketCap: "₹3.6L Cr",
    sector: "Banking",
    exchange: "NSE",
    currency: "₹",
    high52w: 1270.00,
    low52w: 952.15,
    pe: 14.7,
    eps: 80.20,
    dividend: 0.08,
    priceHistory: generatePriceHistory(1178.90)
  }
];

export const globalStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc",
    price: 178.72,
    change: 2.34,
    changePercent: 1.33,
    volume: "58.2M",
    marketCap: "$2.8T",
    sector: "Technology",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 199.62,
    low52w: 164.08,
    pe: 28.9,
    eps: 6.18,
    dividend: 0.54,
    priceHistory: generatePriceHistory(178.72)
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 417.88,
    change: 5.67,
    changePercent: 1.38,
    volume: "22.1M",
    marketCap: "$3.1T",
    sector: "Technology",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 468.35,
    low52w: 309.45,
    pe: 36.2,
    eps: 11.54,
    dividend: 0.68,
    priceHistory: generatePriceHistory(417.88)
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc",
    price: 175.98,
    change: -1.23,
    changePercent: -0.69,
    volume: "18.9M",
    marketCap: "$2.2T",
    sector: "Technology",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 191.75,
    low52w: 129.40,
    pe: 24.8,
    eps: 7.10,
    dividend: 0.0,
    priceHistory: generatePriceHistory(175.98)
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc",
    price: 185.07,
    change: 3.45,
    changePercent: 1.90,
    volume: "42.3M",
    marketCap: "$1.9T",
    sector: "Consumer",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 201.20,
    low52w: 118.35,
    pe: 62.1,
    eps: 2.98,
    dividend: 0.0,
    priceHistory: generatePriceHistory(185.07)
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    price: 248.50,
    change: -12.30,
    changePercent: -4.72,
    volume: "112.5M",
    marketCap: "$789B",
    sector: "Auto",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 299.29,
    low52w: 138.80,
    pe: 68.5,
    eps: 3.63,
    dividend: 0.0,
    priceHistory: generatePriceHistory(248.50)
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.28,
    change: 45.67,
    changePercent: 5.51,
    volume: "48.7M",
    marketCap: "$2.2T",
    sector: "Technology",
    exchange: "NASDAQ",
    currency: "$",
    high52w: 974.00,
    low52w: 373.56,
    pe: 65.3,
    eps: 13.41,
    dividend: 0.04,
    priceHistory: generatePriceHistory(875.28)
  }
];

export const allStocks = [...indianStocks, ...globalStocks];

export const marketIndices: MarketIndex[] = [
  { name: "NIFTY 50", value: 24823.15, change: 156.45, changePercent: 0.63, country: "India" },
  { name: "SENSEX", value: 81741.34, change: 454.12, changePercent: 0.56, country: "India" },
  { name: "BANK NIFTY", value: 51234.80, change: -123.45, changePercent: -0.24, country: "India" },
  { name: "NIFTY IT", value: 42156.90, change: 289.30, changePercent: 0.69, country: "India" },
  { name: "S&P 500", value: 5234.18, change: 24.67, changePercent: 0.47, country: "USA" },
  { name: "NASDAQ", value: 16742.39, change: 87.23, changePercent: 0.52, country: "USA" },
  { name: "DOW JONES", value: 39872.99, change: -45.23, changePercent: -0.11, country: "USA" },
  { name: "FTSE 100", value: 8234.56, change: 12.34, changePercent: 0.15, country: "UK" }
];

export const stockNews: NewsItem[] = [
  {
    id: "1",
    title: "Reliance Industries reports record quarterly profit",
    summary: "Reliance Industries Ltd posted its highest-ever quarterly profit of ₹19,878 crore, beating analyst expectations by 12%.",
    source: "Economic Times",
    time: "2 hours ago",
    sentiment: "positive",
    relatedStocks: ["RELIANCE"]
  },
  {
    id: "2",
    title: "IT sector faces headwinds amid global slowdown",
    summary: "Major IT companies including TCS, Infosys signal cautious outlook for the next quarter due to reduced client spending.",
    source: "Business Standard",
    time: "4 hours ago",
    sentiment: "negative",
    relatedStocks: ["TCS", "INFY", "WIPRO"]
  },
  {
    id: "3",
    title: "RBI keeps repo rate unchanged at 6.5%",
    summary: "The Reserve Bank of India maintained its key lending rate, providing stability for banking stocks.",
    source: "Mint",
    time: "5 hours ago",
    sentiment: "neutral",
    relatedStocks: ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK"]
  },
  {
    id: "4",
    title: "Tata Motors EV sales surge 150% in Q3",
    summary: "Tata Motors reported a massive 150% year-on-year growth in electric vehicle sales, strengthening its market leadership.",
    source: "Moneycontrol",
    time: "6 hours ago",
    sentiment: "positive",
    relatedStocks: ["TATAMOTORS"]
  },
  {
    id: "5",
    title: "NVIDIA announces next-gen AI chips",
    summary: "NVIDIA unveiled its new Blackwell architecture, promising 10x improvement in AI training performance.",
    source: "Reuters",
    time: "8 hours ago",
    sentiment: "positive",
    relatedStocks: ["NVDA"]
  },
  {
    id: "6",
    title: "Apple faces regulatory challenges in EU",
    summary: "European regulators imposed new restrictions on Apple's App Store practices, potentially impacting revenue.",
    source: "Bloomberg",
    time: "10 hours ago",
    sentiment: "negative",
    relatedStocks: ["AAPL"]
  }
];

export const getTopGainers = (): Stock[] => {
  return [...allStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
};

export const getTopLosers = (): Stock[] => {
  return [...allStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
};

export const getMostActive = (): Stock[] => {
  return [...allStocks].sort((a, b) => 
    parseFloat(b.volume.replace('M', '')) - parseFloat(a.volume.replace('M', ''))
  ).slice(0, 5);
};

export const getAIInsight = (stock: Stock): { recommendation: 'Buy' | 'Hold' | 'Sell'; risk: 'Low' | 'Medium' | 'High'; reason: string; tip: string } => {
  const volatility = Math.abs(stock.changePercent);
  const peRatio = stock.pe;
  
  let recommendation: 'Buy' | 'Hold' | 'Sell';
  let risk: 'Low' | 'Medium' | 'High';
  let reason: string;
  let tip: string;

  if (stock.changePercent > 2 && peRatio < 25) {
    recommendation = 'Buy';
    risk = 'Low';
    reason = `${stock.name} is showing strong momentum with a ${stock.changePercent.toFixed(2)}% gain today. The P/E ratio of ${peRatio} suggests reasonable valuation compared to peers.`;
    tip = "Consider starting with a small position and adding more if the upward trend continues.";
  } else if (stock.changePercent < -2 || peRatio > 50) {
    recommendation = 'Sell';
    risk = 'High';
    reason = `${stock.name} shows concerning signals with ${stock.changePercent < 0 ? 'a decline of ' + Math.abs(stock.changePercent).toFixed(2) + '%' : 'high valuation'}. The current P/E of ${peRatio} may indicate overvaluation.`;
    tip = "If you hold this stock, consider setting a stop-loss to protect your investment.";
  } else {
    recommendation = 'Hold';
    risk = volatility > 1.5 ? 'Medium' : 'Low';
    reason = `${stock.name} is trading within a normal range. Current metrics suggest a stable position with no immediate action required.`;
    tip = "Keep monitoring the stock for any significant news or price movements.";
  }

  return { recommendation, risk, reason, tip };
};
