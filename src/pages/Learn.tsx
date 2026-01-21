import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, TrendingDown, DollarSign, PieChart, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

interface LessonSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const lessons: LessonSection[] = [
  {
    id: 'what-is-stock',
    title: 'What is a Stock?',
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <p>A <strong>stock</strong> (also called a share or equity) represents ownership in a company. When you buy a stock, you become a partial owner of that company.</p>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="font-medium text-primary mb-2">🍕 Simple Example:</p>
          <p className="text-sm text-muted-foreground">
            Imagine a pizza shop worth ₹1,00,000. If the shop is divided into 100 shares, each share is worth ₹1,000. 
            If you buy 10 shares, you own 10% of the pizza shop!
          </p>
        </div>
        <h4 className="font-semibold mt-4">Why do companies issue stocks?</h4>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>To raise money for expansion and growth</li>
          <li>To pay off debts</li>
          <li>To fund new projects and research</li>
        </ul>
      </div>
    )
  },
  {
    id: 'profit-loss',
    title: 'How Profit & Loss Works',
    icon: DollarSign,
    content: (
      <div className="space-y-4">
        <p>Your profit or loss depends on the <strong>difference between your buying price and selling price</strong>.</p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">Profit (Gain)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You buy a stock at ₹100 and sell at ₹120.<br/>
              <strong className="text-success">Profit = ₹20 per share (20%)</strong>
            </p>
          </div>
          
          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">Loss</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You buy a stock at ₹100 and sell at ₹80.<br/>
              <strong className="text-destructive">Loss = ₹20 per share (-20%)</strong>
            </p>
          </div>
        </div>

        <h4 className="font-semibold mt-4">Key Terms:</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li><strong>Unrealized P&L:</strong> Profit/loss on stocks you still own (paper gains/losses)</li>
          <li><strong>Realized P&L:</strong> Actual profit/loss when you sell the stock</li>
        </ul>
      </div>
    )
  },
  {
    id: 'stock-market',
    title: 'What is the Stock Market?',
    icon: PieChart,
    content: (
      <div className="space-y-4">
        <p>The <strong>stock market</strong> is a marketplace where buyers and sellers trade stocks (shares of companies).</p>
        
        <h4 className="font-semibold">Major Indian Stock Exchanges:</h4>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-semibold mb-1">NSE (National Stock Exchange)</p>
            <p className="text-sm text-muted-foreground">India's largest stock exchange. NIFTY 50 is its main index.</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-semibold mb-1">BSE (Bombay Stock Exchange)</p>
            <p className="text-sm text-muted-foreground">Asia's oldest exchange. SENSEX is its main index.</p>
          </div>
        </div>

        <h4 className="font-semibold mt-4">What is an Index?</h4>
        <p className="text-muted-foreground">
          An index tracks the performance of a group of stocks. For example, NIFTY 50 tracks India's top 50 companies.
          If NIFTY goes up, it generally means the market is doing well.
        </p>
      </div>
    )
  },
  {
    id: 'key-metrics',
    title: 'Understanding Key Metrics',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold">P/E Ratio (Price-to-Earnings)</p>
            <p className="text-sm text-muted-foreground">
              How much investors pay for each rupee of earnings. Lower P/E might mean undervalued stock.
            </p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold">Market Cap (Market Capitalization)</p>
            <p className="text-sm text-muted-foreground">
              Total value of a company's shares. Large Cap = Big, stable companies. Small Cap = Smaller, potentially riskier.
            </p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold">EPS (Earnings Per Share)</p>
            <p className="text-sm text-muted-foreground">
              How much profit a company makes per share. Higher EPS is generally better.
            </p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold">Dividend Yield</p>
            <p className="text-sm text-muted-foreground">
              Percentage of stock price paid as dividends annually. Some companies share profits with shareholders.
            </p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold">52-Week High/Low</p>
            <p className="text-sm text-muted-foreground">
              Highest and lowest prices in the last year. Helps understand price range and volatility.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'risks',
    title: 'Understanding Risks',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4">
        <p className="text-destructive font-medium">⚠️ Stock market investments are subject to market risks.</p>
        
        <h4 className="font-semibold">Types of Risks:</h4>
        <ul className="space-y-3">
          <li className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-medium">Market Risk</p>
            <p className="text-sm text-muted-foreground">Overall market decline due to economic factors</p>
          </li>
          <li className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-medium">Company Risk</p>
            <p className="text-sm text-muted-foreground">Poor performance or bad news about a specific company</p>
          </li>
          <li className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-medium">Volatility Risk</p>
            <p className="text-sm text-muted-foreground">Rapid price changes that can lead to sudden losses</p>
          </li>
        </ul>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mt-4">
          <p className="font-medium text-primary mb-2">💡 Golden Rule for Beginners:</p>
          <p className="text-sm text-muted-foreground">
            Never invest money you can't afford to lose. Start small, learn, and gradually increase your investments.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'tips',
    title: 'Beginner Tips',
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3">
          <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Start with learning, not earning</p>
              <p className="text-sm text-muted-foreground">Use virtual trading (like this app!) to practice before using real money.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Diversify your portfolio</p>
              <p className="text-sm text-muted-foreground">Don't put all your money in one stock. Spread across different sectors.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Think long-term</p>
              <p className="text-sm text-muted-foreground">Short-term trading is risky. Long-term investing is more reliable.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Research before investing</p>
              <p className="text-sm text-muted-foreground">Understand the company, its financials, and industry before buying.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Control your emotions</p>
              <p className="text-sm text-muted-foreground">Don't panic sell during dips or greedy buy during peaks.</p>
            </div>
          </li>
        </ul>
      </div>
    )
  }
];

const Learn: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('what-is-stock');

  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Learn Stock Market Basics
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Master the fundamentals of stock trading with our beginner-friendly lessons
          </p>
        </motion.section>

        {/* Lessons Accordion */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                    <lesson.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">Lesson {index + 1}</p>
                  </div>
                </div>
                {expandedId === lesson.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {expandedId === lesson.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5"
                >
                  <div className="pt-4 border-t border-border">
                    {lesson.content}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 p-8 glass-card rounded-xl"
        >
          <h2 className="text-xl font-bold text-foreground mb-2">Ready to Practice?</h2>
          <p className="text-muted-foreground mb-4">
            Apply what you've learned with virtual trading. No real money required!
          </p>
          <a 
            href="/stocks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <TrendingUp className="w-5 h-5" />
            Start Virtual Trading
          </a>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Learn;
