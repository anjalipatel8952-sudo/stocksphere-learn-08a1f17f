import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// USD to INR conversion rate (updated periodically)
const USD_TO_INR = 83.5;

// Rate limit handling - Alpha Vantage free tier: 25 requests/day
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Stock symbols mapping for Alpha Vantage
const STOCK_SYMBOLS: Record<string, { symbol: string; exchange: string; name: string; sector: string }> = {
  // Indian stocks (BSE format)
  'RELIANCE': { symbol: 'RELIANCE.BSE', exchange: 'NSE', name: 'Reliance Industries Ltd', sector: 'Energy' },
  'TCS': { symbol: 'TCS.BSE', exchange: 'NSE', name: 'Tata Consultancy Services', sector: 'IT' },
  'HDFCBANK': { symbol: 'HDFCBANK.BSE', exchange: 'NSE', name: 'HDFC Bank Ltd', sector: 'Banking' },
  'INFY': { symbol: 'INFY.BSE', exchange: 'NSE', name: 'Infosys Ltd', sector: 'IT' },
  'ICICIBANK': { symbol: 'ICICIBANK.BSE', exchange: 'NSE', name: 'ICICI Bank Ltd', sector: 'Banking' },
  'HINDUNILVR': { symbol: 'HINDUNILVR.BSE', exchange: 'NSE', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  'BHARTIARTL': { symbol: 'BHARTIARTL.BSE', exchange: 'NSE', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
  'SBIN': { symbol: 'SBIN.BSE', exchange: 'NSE', name: 'State Bank of India', sector: 'Banking' },
  'WIPRO': { symbol: 'WIPRO.BSE', exchange: 'NSE', name: 'Wipro Ltd', sector: 'IT' },
  'TATAMOTORS': { symbol: 'TATAMOTORS.BSE', exchange: 'NSE', name: 'Tata Motors Ltd', sector: 'Auto' },
  'MARUTI': { symbol: 'MARUTI.BSE', exchange: 'NSE', name: 'Maruti Suzuki India Ltd', sector: 'Auto' },
  'AXISBANK': { symbol: 'AXISBANK.BSE', exchange: 'NSE', name: 'Axis Bank Ltd', sector: 'Banking' },
  // US stocks
  'AAPL': { symbol: 'AAPL', exchange: 'NASDAQ', name: 'Apple Inc', sector: 'Technology' },
  'MSFT': { symbol: 'MSFT', exchange: 'NASDAQ', name: 'Microsoft Corporation', sector: 'Technology' },
  'GOOGL': { symbol: 'GOOGL', exchange: 'NASDAQ', name: 'Alphabet Inc', sector: 'Technology' },
  'AMZN': { symbol: 'AMZN', exchange: 'NASDAQ', name: 'Amazon.com Inc', sector: 'Consumer' },
  'TSLA': { symbol: 'TSLA', exchange: 'NASDAQ', name: 'Tesla Inc', sector: 'Auto' },
  'NVDA': { symbol: 'NVDA', exchange: 'NASDAQ', name: 'NVIDIA Corporation', sector: 'Technology' },
};

// Fallback mock data when API limit is reached
const FALLBACK_DATA: Record<string, { price: number; change: number; changePercent: number }> = {
  'RELIANCE': { price: 2847.50, change: 45.30, changePercent: 1.62 },
  'TCS': { price: 4123.75, change: -32.45, changePercent: -0.78 },
  'HDFCBANK': { price: 1689.20, change: 23.80, changePercent: 1.43 },
  'INFY': { price: 1834.55, change: 28.90, changePercent: 1.60 },
  'ICICIBANK': { price: 1245.60, change: -8.75, changePercent: -0.70 },
  'HINDUNILVR': { price: 2456.80, change: 12.35, changePercent: 0.51 },
  'BHARTIARTL': { price: 1567.90, change: 34.20, changePercent: 2.23 },
  'SBIN': { price: 823.45, change: -5.60, changePercent: -0.68 },
  'WIPRO': { price: 467.25, change: 8.90, changePercent: 1.94 },
  'TATAMOTORS': { price: 987.65, change: 42.30, changePercent: 4.48 },
  'MARUTI': { price: 12456.80, change: -156.40, changePercent: -1.24 },
  'AXISBANK': { price: 1178.90, change: 18.65, changePercent: 1.61 },
  'AAPL': { price: 14902.12, change: 195.39, changePercent: 1.33 },
  'MSFT': { price: 34892.98, change: 473.45, changePercent: 1.38 },
  'GOOGL': { price: 14694.33, change: -102.71, changePercent: -0.69 },
  'AMZN': { price: 15453.35, change: 288.12, changePercent: 1.90 },
  'TSLA': { price: 20749.75, change: -1027.16, changePercent: -4.72 },
  'NVDA': { price: 73085.88, change: 3813.46, changePercent: 5.51 },
};

async function fetchStockQuote(symbol: string, apiKey: string): Promise<any> {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${symbol}`);
    return cached.data;
  }

  const stockInfo = STOCK_SYMBOLS[symbol];
  if (!stockInfo) {
    throw new Error(`Unknown stock symbol: ${symbol}`);
  }

  const apiSymbol = stockInfo.symbol;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${apiSymbol}&apikey=${apiKey}`;
  
  console.log(`Fetching quote for ${symbol} (${apiSymbol})`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for rate limit or error
    if (data.Note || data['Error Message'] || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      console.log(`API limit or error for ${symbol}, using fallback data`);
      return getFallbackData(symbol);
    }
    
    const quote = data['Global Quote'];
    const isUSStock = stockInfo.exchange === 'NASDAQ' || stockInfo.exchange === 'NYSE';
    const rawPrice = parseFloat(quote['05. price']);
    const rawChange = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');
    
    // Convert USD stocks to INR
    const price = isUSStock ? rawPrice * USD_TO_INR : rawPrice;
    const change = isUSStock ? rawChange * USD_TO_INR : rawChange;
    
    const result = {
      symbol,
      name: stockInfo.name,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: quote['06. volume'],
      exchange: stockInfo.exchange,
      sector: stockInfo.sector,
      currency: '₹',
      lastUpdated: new Date().toISOString(),
      isLive: true,
    };
    
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return getFallbackData(symbol);
  }
}

function getFallbackData(symbol: string) {
  const stockInfo = STOCK_SYMBOLS[symbol];
  const fallback = FALLBACK_DATA[symbol];
  
  if (!stockInfo || !fallback) {
    throw new Error(`No data available for ${symbol}`);
  }
  
  // Add small random variation to simulate movement
  const variation = (Math.random() - 0.5) * 0.02;
  const price = fallback.price * (1 + variation);
  const change = fallback.change * (1 + variation);
  
  return {
    symbol,
    name: stockInfo.name,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(fallback.changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000).toString(),
    exchange: stockInfo.exchange,
    sector: stockInfo.sector,
    currency: '₹',
    lastUpdated: new Date().toISOString(),
    isLive: false,
    note: 'Using demo data (API limit reached or market closed)',
  };
}

async function fetchTimeSeries(symbol: string, apiKey: string): Promise<any[]> {
  const cacheKey = `series_${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const stockInfo = STOCK_SYMBOLS[symbol];
  if (!stockInfo) {
    return generateMockHistory(symbol);
  }

  const apiSymbol = stockInfo.symbol;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${apiSymbol}&outputsize=compact&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Note || data['Error Message'] || !data['Time Series (Daily)']) {
      console.log(`Using mock history for ${symbol}`);
      return generateMockHistory(symbol);
    }
    
    const timeSeries = data['Time Series (Daily)'];
    const isUSStock = stockInfo.exchange === 'NASDAQ' || stockInfo.exchange === 'NYSE';
    
    const history = Object.entries(timeSeries)
      .slice(0, 365)
      .map(([date, values]: [string, any]) => {
        const closePrice = parseFloat(values['4. close']);
        return {
          date,
          price: Number((isUSStock ? closePrice * USD_TO_INR : closePrice).toFixed(2)),
        };
      })
      .reverse();
    
    cache.set(cacheKey, { data: history, timestamp: Date.now() });
    return history;
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    return generateMockHistory(symbol);
  }
}

function generateMockHistory(symbol: string): { date: string; price: number }[] {
  const fallback = FALLBACK_DATA[symbol];
  const basePrice = fallback?.price || 1000;
  const history: { date: string; price: number }[] = [];
  let currentPrice = basePrice * (0.8 + Math.random() * 0.2);
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const { action, symbols } = await req.json();
    
    if (action === 'quotes') {
      // Fetch multiple stock quotes
      const stockSymbols = symbols || Object.keys(STOCK_SYMBOLS);
      const quotes = await Promise.all(
        stockSymbols.map((symbol: string) => fetchStockQuote(symbol, apiKey))
      );
      
      return new Response(JSON.stringify({ 
        stocks: quotes,
        lastUpdated: new Date().toISOString(),
        usdToInr: USD_TO_INR,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'quote') {
      // Fetch single stock quote
      const symbol = symbols[0];
      const quote = await fetchStockQuote(symbol, apiKey);
      
      return new Response(JSON.stringify(quote), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'history') {
      // Fetch price history
      const symbol = symbols[0];
      const history = await fetchTimeSeries(symbol, apiKey);
      
      return new Response(JSON.stringify({ 
        symbol,
        history,
        lastUpdated: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'supported') {
      // Return list of supported symbols
      return new Response(JSON.stringify({ 
        symbols: Object.keys(STOCK_SYMBOLS),
        stocks: Object.entries(STOCK_SYMBOLS).map(([symbol, info]) => ({
          symbol,
          ...info,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Stock data error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackAvailable: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
